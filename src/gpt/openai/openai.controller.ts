import { Body, Controller, Get, Post } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { GrantedRoles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/chatdb/entities/user.entity';

@Controller('openai')
export class OpenaiController {
  constructor(private openAIService: OpenAIService) {}
  @GrantedRoles([UserRole.NORMAL_USER])
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
