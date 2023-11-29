import { Module } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';
import { ChatdbModule } from 'src/chatdb/chatdb.module';
import { OpenaiController } from './openai/openai.controller';

@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],
  imports: [ChatdbModule],
  controllers: [OpenaiController],
})
export class GptModule {}
