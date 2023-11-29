import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSession } from 'src/chatdb/entities/chat-session.entity';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { ClientOptions, OpenAI } from 'openai';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
import { getBeijingTime } from 'src/utils';
import { OpenAIToken } from 'src/chatdb/entities/open-ai-token.entity';
@Injectable()
export class OpenAIService {
  constructor(
    private openaiToken: OpenAITokenService,
    private chatSessionService: ChatSessionService,
  ) {}
  private _activeToken: OpenAIToken | null = null;
  async getActiveToken() {
    if (this._activeToken) {
      return this._activeToken;
    }
    const activeTokens = await this.openaiToken.getActiveTokens();
    if (!activeTokens.length) {
      throw new NotFoundException('No active tokens found');
    }
    this._activeToken =
      activeTokens[(Math.random() * activeTokens.length) | 0] || null;
    return this._activeToken;
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
          apiKey: token.token,
        };
        if (token.baseUrl) {
          config.baseURL = token.baseUrl;
        } else if (process.env.NODE_ENV === 'development') {
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
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `现在是北京时间 ${getBeijingTime()}`,
      },
    ];
    if (chatSession.systemMessage) {
      messages.push({
        role: 'system',
        content: chatSession.systemMessage,
      });
    }
    for (const message of chatSession.historyMessages) {
      const role = message.senderId === message.wechatId ? 'assistant' : 'user';
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
        model: chatSession.hasGptCompletionFeature
          ? 'gpt-4-1106-preview'
          : 'gpt-3.5-turbo',
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
