import { Module } from '@nestjs/common';
import { TokenController } from './token/token.controller';
import { ChatdbModule } from 'src/chatdb/chatdb.module';

@Module({
  imports: [ChatdbModule],
  controllers: [TokenController],
})
export class TokenModule {}
