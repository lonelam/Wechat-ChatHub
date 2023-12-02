import {
  Body,
  Controller,
  Get,
  Request,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  BadRequestException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { WechatService } from './wechat.service';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
import { BotToJson } from './expose-bot';
import { WechatAccountService } from 'src/chatdb/wechat-account/wechat-account.service';
import { GrantedRoles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/chatdb/entities/user.entity';

@Controller('wechat')
export class WechatController {
  constructor(
    private wechatService: WechatService,
    private wechatAccountService: WechatAccountService,
    private chatSession: ChatSessionService,
  ) {}

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('start')
  async start(@Request() req: Express.Request) {
    try {
      const { qrcode, bot } = await this.wechatService.startWechatBot(
        req.user.id,
      );
      return {
        qrcode,
        bot: await BotToJson(bot),
      };
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Get('bot')
  async getBot(@Query('id') botId: string, @Request() req: Express.Request) {
    try {
      const bot = await this.wechatService.getBot(botId, req.user.id);
      if (!bot) {
        throw new NotFoundException('Bot not found');
      }

      return BotToJson(bot);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Get('chat-sessions')
  async getChats(
    @Query('wechat_id') wechatId: string,
    @Request() req: Express.Request,
  ) {
    try {
      const wechatAccount = await this.wechatService.getAccountWithLoginState(
        wechatId,
        req.user.id,
      );

      if (!wechatAccount) {
        throw new BadRequestException('Wechat account not found');
      }

      if (wechatAccount.ownerId === req.user.id) {
        // owner获得全部聊天记录
        const chatSessions =
          await this.chatSession.getAllChatSessionsOfWechatId(wechatId);
        return {
          chatSessions,
          wechatAccount,
        };
      }
      // 被抢走控制权的哥们不允许看新消息所在的对话
      const chatSessions =
        await this.chatSession.getAllChatSessionsOfWechatIdAndOwner(
          wechatId,
          req.user.id,
        );
      return {
        chatSessions,
        wechatAccount,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('complete-chat-session')
  async completeChatSession(
    @Body() body: { sessionId: number },
    @Request() req: Express.Request,
  ) {
    const chatSession =
      await this.wechatService.gptCompleteForActiveMessageBySessionId(
        body.sessionId,
      );

    if (chatSession.ownerId !== req.user.id) {
      throw new ForbiddenException();
    }
    return {
      data: chatSession,
    };
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Get('accounts')
  async getAccounts(@Request() req: Express.Request) {
    try {
      const accounts = await this.wechatService.getAllAccountsWithLoginState(
        req.user.id,
      );
      return {
        data: accounts,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('say')
  async say(
    @Body() body: { listenerId: string; textContent: string; wechatId: string },
    @Request() req: Express.Request,
  ) {
    try {
      const sentMessage = await this.wechatService.sayToListener(
        body.textContent,
        body.listenerId,
        body.wechatId,
        req.user.id,
      );
      return sentMessage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('admin/sessions')
  async adminGetAllSessions() {
    const sessions = await this.chatSession.adminGetAllSessions();
    return { data: sessions };
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Get('sessions')
  async getAllSessions(@Request() req: Express.Request) {
    const sessions = await this.chatSession.getAllSessions(req.user.id);
    return { data: sessions };
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('update/system_message')
  async updateSystemMessage(
    @Body() body: { sessionId: number; message: string },
    @Request() req: Express.Request,
  ) {
    if (req.user.roles.find((role) => role.name === UserRole.ADMIN)) {
      await this.chatSession.updateSystemMessageById(
        body.sessionId,
        body.message,
      );
    } else {
      await this.chatSession.updateSystemMessageById(
        body.sessionId,
        body.message,
        req.user.id,
      );
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('update/feature')
  async updateFeatureFlags(
    @Body() body: { sessionId: number; feature: number },
    @Request() req: Express.Request,
  ) {
    if (req.user.roles.find((role) => role.name === UserRole.ADMIN)) {
      await this.chatSession.updateFeatureFlagsById(
        body.sessionId,
        body.feature,
      );
    } else {
      await this.chatSession.updateFeatureFlagsById(
        body.sessionId,
        body.feature,
        req.user.id,
      );
    }
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('logout')
  async logout(
    @Body() body: { wechatId: string },
    @Req() req: Express.Request,
  ) {
    if (req.user.roles.find((role) => role === UserRole.ADMIN)) {
      await this.wechatService.adminLogout(body.wechatId);
    } else {
      await this.wechatService.logout(body.wechatId, req.user.id);
    }
  }
}
