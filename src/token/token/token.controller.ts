import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Request,
  Post,
  Query,
} from '@nestjs/common';
import { GrantedRoles } from 'src/auth/roles.decorator';
import { OpenAIToken } from 'src/chatdb/entities/open-ai-token.entity';
import { PadLocalToken } from 'src/chatdb/entities/pad-local-token.entity';
import { UserRole } from 'src/chatdb/entities/user.entity';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { PadLocalTokenService } from 'src/chatdb/pad-local-token/pad-local-token.service';
import { OpenAIService } from 'src/gpt/openai/openai.service';

@Controller('token')
export class TokenController {
  constructor(
    private openAIToken: OpenAITokenService,
    private padLocalToken: PadLocalTokenService,
    private openAIService: OpenAIService,
  ) {}

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('create/openai')
  async createOpenAIToken(
    @Body() body: { token: string; baseUrl: string },
    @Request() req: Express.Request,
  ) {
    const hadOldToken = await this.openAIToken.getTokenByValue(body.token);
    if (hadOldToken) {
      throw new HttpException('Token exists', HttpStatus.BAD_REQUEST);
    }

    const newToken = await this.openAIToken.addToken(
      body.token,
      body.baseUrl,
      req.user.id,
    );
    return newToken;
  }

  @GrantedRoles([UserRole.NORMAL_USER])
  @Post('create/pad-local')
  async createPadLocalToken(
    @Body() body: { token: string; puppetType: string },
    @Request() req: Express.Request,
  ) {
    const newToken = await this.padLocalToken.createToken(
      body.token,
      body.puppetType,
      req.user.id,
    );
    return newToken;
  }

  @Post('update/openai')
  async updateOpenAIToken(@Body() body: { data: OpenAIToken }) {
    return this.openAIToken.updateToken(body.data);
  }

  @Get()
  async all(): Promise<{
    openai: OpenAIToken[];
    'pad-local': PadLocalToken[];
  }> {
    const [openAITokens, padLocalTokens] = await Promise.all([
      this.openAIToken.getAllTokens(),
      this.padLocalToken.getAllTokens(),
    ]);
    return {
      openai: openAITokens,
      'pad-local': padLocalTokens,
    };
  }

  @Get('activate')
  async activate(@Query('type') type: string, @Query('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid id: ${id}`);
    }
    switch (type) {
      case 'openai': {
        const token = await this.openAIToken.getTokenById(parsedId);
        if (!token) {
          throw new NotFoundException(`Token with id ${id} not found`);
        }
        if (!token.isActive) {
          await this.openAIToken.activateToken(token.id);
        }
        return;
      }
      case 'pad-local': {
        const token = await this.padLocalToken.getTokenById(parsedId);
        if (!token) {
          throw new NotFoundException(`Token with id ${id} not found`);
        }
        if (!token.isActive) {
          await this.padLocalToken.activateToken(token.id);
        }
        return;
      }
      default:
        throw new BadRequestException(`Unknown token type ${type}`);
    }
  }

  @Get('deactivate')
  async deactivate(@Query('type') type: string, @Query('id') id: string) {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid id ${id}`);
    }
    switch (type) {
      case 'openai': {
        const token = await this.openAIToken.getTokenById(parsedId);
        this.openAIService.cleanToken();
        if (!token) {
          throw new NotFoundException(`Token with id ${id} not found`);
        }
        if (token.isActive) {
          await this.openAIToken.deactivateToken(token.id);
        }
        return;
      }
      case 'pad-local': {
        const token = await this.padLocalToken.getTokenById(parsedId);
        if (!token) {
          throw new NotFoundException(`Token with id ${id} not found`);
        }
        if (token.isActive) {
          await this.padLocalToken.deactivateToken(token.id);
        }
        return;
      }
      default:
        throw new BadRequestException(`Unknown token type ${type}`);
    }
  }
}
