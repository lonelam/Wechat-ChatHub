import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatSession } from 'src/chatdb/entities/chat-session.entity';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { ClientOptions, OpenAI } from 'openai';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
import { getBeijingTime } from 'src/utils';
import { OpenAIToken } from 'src/chatdb/entities/open-ai-token.entity';

type CompletionModelsType =
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4'
  | 'gpt-4-0314'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0314'
  | 'gpt-4-32k-0613'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-0301'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-16k-0613';
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

  currentLowerModel: CompletionModelsType = 'gpt-3.5-turbo';

  currentHigherModel: CompletionModelsType = 'gpt-4-32k';

  private tokenLimit = 4000;

  cleanToken() {
    this._activeToken = null;
  }

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
    let tokenCount = 0;
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `现在是北京时间 ${getBeijingTime()}`,
      },
    ];

    const revMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [];

    tokenCount += messages[0].content?.length || 0;

    if (chatSession.systemMessage) {
      messages.push({
        role: 'system',
        content: chatSession.systemMessage,
      });
      tokenCount += chatSession.systemMessage.length;
    }

    // 倒序排列
    const revHistory = chatSession.historyMessages.toSorted((a, b) => {
      return b.sendTime.valueOf() - a.sendTime.valueOf();
    });

    for (const message of revHistory) {
      const role = message.senderId === message.wechatId ? 'assistant' : 'user';
      if (tokenCount + message.textContent.length > this.tokenLimit) {
        break;
      }

      if (
        revMessages.length &&
        revMessages[revMessages.length - 1]?.role === role
      ) {
        revMessages[revMessages.length - 1].content +=
          '\n' + message.textContent;
      } else {
        revMessages.push({
          role,
          content: message.textContent,
        });
      }
    }
    messages = messages.concat(revMessages.reverse());
    try {
      const complation = openai.chat.completions.create({
        model: chatSession.hasGptCompletionFeature
          ? this.currentHigherModel
          : this.currentLowerModel,
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
