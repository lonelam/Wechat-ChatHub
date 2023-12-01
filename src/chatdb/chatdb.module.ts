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
import { HistoryMessage } from './entities/history-message.entity';
import { UserService } from './user/user.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Role,
      ChatSession,
      Friend,
      OpenAIToken,
      PadLocalToken,
      WechatAccount,
      HistoryMessage,
    ]),
  ],
  providers: [
    FriendService,
    PadLocalTokenService,
    ChatSessionService,
    WechatAccountService,
    OpenAITokenService,
    UserService,
  ],
  exports: [
    FriendService,
    PadLocalTokenService,
    ChatSessionService,
    WechatAccountService,
    OpenAITokenService,
    UserService,
  ],
})
export class ChatdbModule {}
