import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { FriendService } from '../friend/friend.service';
import { WechatAccountService } from '../wechat-account/wechat-account.service';
import { Friend } from '../entities/friend.entity';
import { HistoryMessage } from '../entities/history-message.entity';
import { WechatAccount } from '../entities/wechat-account.entity';

@Injectable()
export class ChatSessionService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(HistoryMessage)
    private historyMessageRepository: Repository<HistoryMessage>,
    private friendService: FriendService,
    private wechatAccount: WechatAccountService,
  ) {}

  async updateFeatureFlagsById(id: number, feature: number, ownerId?: number) {
    let result;

    if (ownerId) {
      result = await this.chatSessionRepository.update(
        { id, ownerId },
        { featureFlags: feature },
      );
    } else {
      result = await this.chatSessionRepository.update(
        { id },
        { featureFlags: feature },
      );
    }
    if (!result.affected) {
      throw new NotFoundException(`the conversation with id ${id} not found`);
    }
  }

  async updateSystemMessageById(
    id: number,
    systemMessage: string,
    ownerId?: number,
  ) {
    let result;
    if (ownerId) {
      result = await this.chatSessionRepository.update(
        { id, ownerId },
        {
          systemMessage,
        },
      );
    } else {
      result = await this.chatSessionRepository.update(
        { id },
        {
          systemMessage,
        },
      );
    }
    if (!result.affected) {
      throw new NotFoundException(`the conversation with id ${id} not found`);
    }
  }

  getChatSessionById(sessionId: number) {
    return this.chatSessionRepository.findOne({
      where: { id: sessionId },
      relations: {
        friends: true,
        wechatAccount: true,
        historyMessages: true,
        replyOwnerMessage: true,
      },
    });
  }

  async getOrCreateChatSession(
    wechatId: string,
    conversationId: string,
    chatterInfo: Friend,
    ownerId: number,
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      const chatSessionRepository = entityManager.getRepository(ChatSession);
      const wechatAccountRepository =
        entityManager.getRepository(WechatAccount);

      // Find the chat session
      const chatSession = await chatSessionRepository.findOne({
        where: { conversationId, wechatAccount: { wechatId } },
        relations: {
          friends: true,
          wechatAccount: true,
          historyMessages: true,
          replyOwnerMessage: true,
        },
      });

      // If the chat session exists, update it
      if (chatSession) {
        chatSession.friends.push(chatterInfo);
        chatSession.ownerId = ownerId;
        return await chatSessionRepository.save(chatSession);
      }

      // If the chat session doesn't exist, create a new one
      const wechatAccount = await wechatAccountRepository.findOne({
        where: { wechatId },
      });

      if (!wechatAccount) {
        throw new InternalServerErrorException(
          `chat session not found, wechatId: ${wechatId}`,
        );
      }

      const newChatSession = chatSessionRepository.create({
        conversationId,
        wechatAccount,
        friends: [chatterInfo],
        ownerId,
      });

      return await chatSessionRepository.save(newChatSession);
    });
  }

  async checkChatSessionNeedReplySince(
    sessionId: number,
    sinceTime: Date,
    replierId: string,
    replyOwnerMessageId: number,
  ) {
    try {
      const result = await this.historyMessageRepository.count({
        where: {
          chatSession: { id: sessionId },
          sendTime: MoreThan(sinceTime),
          senderId: replierId,
        },
      });
      if (result === 0) {
        return await this.chatSessionRepository.exist({
          where: {
            id: sessionId,
            replyOwnerMessage: {
              id: replyOwnerMessageId,
            },
          },
        });
      }
      return !result;
    } catch (error) {
      console.error(`query chat session history error: ${error}`);
      return false;
    }
  }

  async addMessageToChatSession(
    conversationId: string,
    wechatId: string,
    type: number,
    textContent: string,
    senderId: string,
    receiverId: string,
    source: string,
    sendTime: Date,
    ownerId: number,
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      const chatSessionRepository = entityManager.getRepository(ChatSession);
      const historyMessageRepository =
        entityManager.getRepository(HistoryMessage);

      // Find the chat session
      const chatSession = await chatSessionRepository.findOne({
        where: {
          conversationId,
          wechatAccount: {
            wechatId,
          },
        },
        relations: {
          historyMessages: true,
        },
      });

      if (!chatSession) {
        throw new Error(`Chat session with id ${conversationId} not found`);
      }

      // Save the message
      let message = historyMessageRepository.create({
        wechatId,
        type,
        textContent,
        senderId,
        receiverId,
        source,
        chatSession,
        sendTime,
        ownerId,
      });

      message = await historyMessageRepository.save(message);

      await chatSessionRepository.update(chatSession.id, {
        replyOwnerMessage: message,
      });

      chatSession.historyMessages.push(message);
      chatSession.replyOwnerMessage = message;

      if (!chatSession) {
        throw new NotFoundException('chat session not found');
      }

      message.chatSession = chatSession;

      return message;
    });
  }

  async updateActiveMessage(chatSession: ChatSession, activeMessage: string) {
    chatSession.activeMessage = activeMessage;
    await this.chatSessionRepository.update(chatSession.id, {
      activeMessage,
    });
    return chatSession;
  }

  async getAllChatSessionsOfWechatId(wechatId: string) {
    return await this.chatSessionRepository.find({
      where: {
        wechatAccount: {
          wechatId,
        },
      },
      relations: {
        wechatAccount: true,
        friends: true,
        historyMessages: true,
        replyOwnerMessage: true,
      },
    });
  }

  async getAllChatSessionsOfWechatIdAndOwner(
    wechatId: string,
    ownerId: number,
  ) {
    return await this.chatSessionRepository.find({
      where: {
        wechatAccount: {
          wechatId,
        },
        ownerId: ownerId,
      },
      relations: {
        wechatAccount: true,
        friends: true,
        historyMessages: true,
        replyOwnerMessage: true,
      },
    });
  }

  async adminGetAllSessions() {
    return await this.chatSessionRepository.find({
      relations: ['wechatAccount', 'friends'],
    });
  }
  async getAllSessions(ownerId: number) {
    return await this.chatSessionRepository.find({
      where: {
        ownerId: ownerId,
      },
      relations: ['wechatAccount', 'friends'],
    });
  }
}
