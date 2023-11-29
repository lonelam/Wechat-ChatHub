import { Module } from '@nestjs/common';
import { TokenController } from './token/token.controller';
import { ChatdbModule } from 'src/chatdb/chatdb.module';
import { GptModule } from 'src/gpt/gpt.module';

@Module({
  imports: [ChatdbModule, GptModule],
  controllers: [TokenController],
})
export class TokenModule {}
