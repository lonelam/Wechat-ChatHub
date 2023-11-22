import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendService } from './friend/friend.service';
import { PadLocalTokenService } from './pad-local-token/pad-local-token.service';
import { ChatSessionService } from './chat-session/chat-session.service';
import { WechatAccountService } from './wechat-account/wechat-account.service';
import { OpenAITokenService } from './open-ai-token/open-ai-token.service';
import { ChatSession } from './entities/chat-session.entity';
import { Friend } from './entities/friend.entity';
import { OpenAIToken } from './entities/open-ai-token.entity';
import { PadLocalToken } from './entities/pad-local-token.entity';
import { WechatAccount } from './entities/wechat-account.entity';
@Module({
    imports: [ConfigModule,
        TypeOrmModule.forFeature([ChatSession,
            Friend, OpenAIToken,
            PadLocalToken, WechatAccount])],
    providers: [
        FriendService,
        PadLocalTokenService,
        ChatSessionService,
        WechatAccountService,
        OpenAITokenService,
    ],
})
export class ChatdbModule { }
