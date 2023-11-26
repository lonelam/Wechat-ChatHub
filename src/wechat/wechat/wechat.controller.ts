import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { WechatService } from './wechat.service';
import { ChatSessionService } from 'src/chatdb/chat-session/chat-session.service';
import { BotToJson } from './expose-bot';

@Controller('wechat')
export class WechatController {
  constructor(
    private wechatService: WechatService,
    private chatSession: ChatSessionService,
  ) {}
  @Post('start')
  async start() {
    try {
      const { qrcode, bot } = await this.wechatService.startWechatBot();
      return {
        qrcode,
        bot: await BotToJson(bot),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  @Get('bot')
  async getBot(@Query('id') botId: string) {
    try {
      const bot = await this.wechatService.getBot(botId);
      if (!bot) {
        throw new NotFoundException('Bot not found');
      }

      return BotToJson(bot);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('chat-sessions')
  async getChats(@Query('wechat_id') wechatId: string) {
    try {
      const chats =
        await this.chatSession.getAllChatSessionsOfWechatId(wechatId);

      return {
        data: chats,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('accounts')
  async getAccounts() {
    try {
      const accounts = await this.wechatService.getAllAccountsWithLoginState();
      return {
        data: accounts,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post('say')
  async say(
    @Body() body: { listenerId: string; textContent: string; wechatId: string },
  ) {
    try {
      const sentMessage = await this.wechatService.sayToListener(
        body.textContent,
        body.listenerId,
        body.wechatId,
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

  @Post('update/system_message')
  async updateSystemMessage(
    @Body() body: { sessionId: number; message: string },
  ) {
    await this.chatSession.updateSystemMessageById(
      body.sessionId,
      body.message,
    );
  }

  @Post('logout')
  async logout(@Body() body: { wechatId: string }) {
    this.wechatService.logout(body.wechatId);
  }
}
