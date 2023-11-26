import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSession } from 'src/chatdb/entities/chat-session.entity';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { ClientOptions, OpenAI } from 'openai';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
@Injectable()
export class OpenAIService {
  constructor(
    private openaiToken: OpenAITokenService,
    private chatSessionService: ChatSessionService,
  ) {}
  private _activeToken: string = '';
  async getActiveToken() {
    if (this._activeToken) {
      return this._activeToken;
    }
    const activeTokens = await this.openaiToken.getActiveTokens();
    if (!activeTokens.length) {
      throw new NotFoundException('No active tokens found');
    }
    return (this._activeToken =
      activeTokens[(Math.random() * activeTokens.length) | 0].token);
  }

  private _openai: OpenAI | null = null;

  private _openaiCreation: Promise<OpenAI> | null = null;

  async getOpenAI() {
    if (!this._openai) {
      if (this._openaiCreation) {
        return this._openaiCreation;
      }
      this._openaiCreation = new Promise<OpenAI>(async (resolve) => {
        const token = await this.getActiveToken();
        const config: ClientOptions = {
          apiKey: token,
        };
        if (process.env.NODE_ENV === 'development') {
          config.baseURL = 'https://aiproxy.laizn.com/v1';
        }

        this._openai = new OpenAI(config);
        resolve(this._openai);
      });
      return this._openaiCreation;
    }
    return this._openai;
  }

  async generateCompletion(chatSession: ChatSession) {
    const openai = await this.getOpenAI();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (chatSession.systemMessage) {
      messages.push({
        role: 'system',
        content: chatSession.systemMessage,
      });
    }
    for (const message of chatSession.historyMessages) {
      const role = message.senderId === message.wechatId ? 'user' : 'assistant';
      if (messages.length && messages[messages.length - 1]?.role === role) {
        messages[messages.length - 1].content += '\n' + message.textContent;
      } else {
        messages.push({
          role,
          content: message.textContent,
        });
      }
    }
    try {
      const complation = openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
      });
      const createResp = await complation;

      const suggestedMessage = createResp.choices[0].message.content;
      if (suggestedMessage) {
        await this.chatSessionService.updateActiveMessage(
          chatSession,
          suggestedMessage,
        );
        return suggestedMessage;
      }
    } catch (error) {
      console.error('ChatGPT Completion failed', error);
    }
    return null;
  }
}
