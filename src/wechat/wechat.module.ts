import { Module } from '@nestjs/common';
import { WechatController } from './wechat/wechat.controller';
import { WechatService } from './wechat/wechat.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';
import { GptModule } from 'src/gpt/gpt.module';

@Module({
  imports: [ChatdbModule, GptModule],
  controllers: [WechatController],
  providers: [WechatService],
})
export class WechatModule {}
