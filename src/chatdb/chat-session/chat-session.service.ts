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
import { MessageInterface } from 'wechaty/impls';
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

  async updateFeatureFlagsById(id: number, feature: number) {
    const result = await this.chatSessionRepository.update(
      { id },
      { featureFlags: feature },
    );
    if (!result.affected) {
      throw new NotFoundException(`the conversation with id ${id} not found`);
    }
  }

  async updateSystemMessageById(id: number, systemMessage: string) {
    const result = await this.chatSessionRepository.update(
      { id },
      { systemMessage },
    );
    if (!result.affected) {
      throw new NotFoundException(`the conversation with id ${id} not found`);
    }
  }
  async getOrCreateChatSession(
    wechatId: string,
    conversationId: string,
    chatterInfo: Friend,
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      const chatSessionRepository = entityManager.getRepository(ChatSession);
      const wechatAccountRepository =
        entityManager.getRepository(WechatAccount);

      // Find the chat session
      const chatSession = await chatSessionRepository.findOne({
        where: { conversationId },
        relations: ['friends', 'wechatAccount'], // Assuming you want to load these relations
      });

      // If the chat session exists, update it
      if (chatSession) {
        chatSession.friends.push(chatterInfo);
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

      return await chatSessionRepository.save({
        conversationId,
        wechatAccount,
        friends: [chatterInfo],
      });
    });
  }

  async checkChatSessionNeedReplySince(
    sessionId: number,
    sinceTime: Date,
    replierId: string,
    replyOwnerId: number,
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
              id: replyOwnerId,
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
  ) {
    return this.dataSource.transaction(async (entityManager) => {
      const chatSessionRepository = entityManager.getRepository(ChatSession);
      const historyMessageRepository =
        entityManager.getRepository(HistoryMessage);

      // Find the chat session
      const chatSession = await chatSessionRepository.findOne({
        where: { conversationId },
        relations: {
          historyMessages: true,
        },
      });

      if (!chatSession) {
        throw new Error(`Chat session with id ${conversationId} not found`);
      }

      // Save the message
      const message = await historyMessageRepository.save({
        wechatId,
        type,
        textContent,
        senderId,
        receiverId,
        source,
        chatSession,
        sendTime,
      });

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
    return await this.chatSessionRepository.save(chatSession);
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

  async adminGetAllSessions() {
    return await this.chatSessionRepository.find({
      relations: ['wechatAccount', 'friends'],
    });
  }

  // Methods to create, find, update chat sessions...
}
