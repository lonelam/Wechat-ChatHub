import { Module } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';

@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],
  imports: [ChatdbModule],
})
export class GptModule {}
