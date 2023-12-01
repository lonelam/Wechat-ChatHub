import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

@Module({
  imports: [ChatdbModule, PassportModule],
  exports: [AuthService],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
