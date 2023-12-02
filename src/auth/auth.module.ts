import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    ChatdbModule,
    PassportModule.register({ session: true, defaultStrategy: 'local' }),
  ],
  exports: [AuthService],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
