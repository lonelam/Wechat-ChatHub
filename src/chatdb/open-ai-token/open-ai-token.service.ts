import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAIToken } from '../entities/open-ai-token.entity';

@Injectable()
export class OpenAITokenService {
  constructor(
    @InjectRepository(OpenAIToken)
    private openAITokenRepository: Repository<OpenAIToken>,
  ) {}

  async updateToken(token: OpenAIToken) {
    if (token.id) {
      const oldToken = await this.openAITokenRepository.findOne({
        where: { id: token.id },
      });
      if (oldToken) {
        return this.openAITokenRepository.save(token);
      }
    }
    throw new BadRequestException(`Token with id ${token.id} not found`);
  }

  async addToken(
    tokenValue: string,
    baseUrl: string,
    ownerId: number,
  ): Promise<OpenAIToken> {
    const token = this.openAITokenRepository.create({
      token: tokenValue,
      baseUrl,
      ownerId,
    });
    return this.openAITokenRepository.save(token);
  }

  async activateToken(tokenId: number): Promise<void> {
    const result = await this.openAITokenRepository.update(tokenId, {
      isActive: true,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Token with id ${tokenId} not found`);
    }
  }

  async deactivateToken(tokenId: number): Promise<void> {
    const result = await this.openAITokenRepository.update(tokenId, {
      isActive: false,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Token with id ${tokenId} not found`);
    }
  }

  async getTokenByValue(tokenValue: string): Promise<OpenAIToken | null> {
    return this.openAITokenRepository.findOne({ where: { token: tokenValue } });
  }

  async getActiveTokens(): Promise<OpenAIToken[]> {
    return this.openAITokenRepository.find({ where: { isActive: true } });
  }

  async getAllTokens(): Promise<OpenAIToken[]> {
    return this.openAITokenRepository.find();
  }

  async getTokenById(id: number): Promise<OpenAIToken | null> {
    return this.openAITokenRepository.findOne({ where: { id } });
  }
}
