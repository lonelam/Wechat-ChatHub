import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAIToken } from '../entities/open-ai-token.entity';

@Injectable()
export class OpenAITokenService {
  constructor(
    @InjectRepository(OpenAIToken)
    private openAITokenRepository: Repository<OpenAIToken>,
  ) {}

  async addToken(tokenValue: string): Promise<OpenAIToken> {
    const token = this.openAITokenRepository.create({ token: tokenValue });
    return this.openAITokenRepository.save(token);
  }

  async deactivateToken(tokenId: number): Promise<void> {
    await this.openAITokenRepository.update(tokenId, { isActive: false });
  }

  async getTokenById(tokenId: number): Promise<OpenAIToken | null> {
    return this.openAITokenRepository.findOne({ where: { id: tokenId } });
  }

  async getActiveTokens(): Promise<OpenAIToken[]> {
    return this.openAITokenRepository.find({ where: { isActive: true } });
  }
  
  // Additional methods as needed...
}
