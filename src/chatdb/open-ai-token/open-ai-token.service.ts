import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.openAITokenRepository.save(token);
  }

  async addToken(tokenValue: string): Promise<OpenAIToken> {
    const token = this.openAITokenRepository.create({ token: tokenValue });
    return this.openAITokenRepository.save(token);
  }

  async activateToken(tokenId: number): Promise<void> {
    await this.openAITokenRepository.update(tokenId, {
      isActive: true,
    });
  }

  async deactivateToken(tokenId: number): Promise<void> {
    await this.openAITokenRepository.update(tokenId, {
      isActive: false,
    });
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

  // Additional methods as needed...
}
