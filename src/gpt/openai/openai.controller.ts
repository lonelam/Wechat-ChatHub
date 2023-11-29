import { Body, Controller, Get, Post } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private openAIService: OpenAIService) {}
  @Get('models')
  getCurrentModels() {
    return {
      lower: this.openAIService.currentLowerModel,
      higher: this.openAIService.currentHigherModel,
    };
  }
  @Post('models/update')
  updateCurrentModels(@Body() body: { lower: string; higher: string }) {
    this.openAIService.currentHigherModel = body.higher as any;
    this.openAIService.currentLowerModel = body.lower as any;
    return {
      lower: this.openAIService.currentLowerModel,
      higher: this.openAIService.currentHigherModel,
    };
  }
}
