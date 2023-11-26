import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  TokenCreateRequest,
  TokenCreateResponse,
  TokenGetResponse,
} from 'api/token.interface';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { PadLocalTokenService } from 'src/chatdb/pad-local-token/pad-local-token.service';

@Controller('token')
export class TokenController {
  constructor(
    private openAIToken: OpenAITokenService,
    private padLocalToken: PadLocalTokenService,
  ) {}
  @Post('create')
  async create(@Body() body: TokenCreateRequest): Promise<TokenCreateResponse> {
    if (body.type === 'openai') {
      const hadOldToken = await this.openAIToken.getTokenByValue(body.token);
      if (hadOldToken) {
        throw new HttpException('Token exists', HttpStatus.BAD_REQUEST);
      }
      const newToken = await this.openAIToken.addToken(body.token);
      return newToken;
    }

    if (body.type === 'pad-local') {
      const newToken = await this.padLocalToken.createToken(body.token);
      return newToken;
    }

    throw new HttpException('No such token type', HttpStatus.BAD_REQUEST);
  }

  @Get()
  async all(): Promise<TokenGetResponse> {
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
        let token = await this.openAIToken.getTokenById(parsedId);
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
        let token = await this.openAIToken.getTokenById(parsedId);
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
