import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PadLocalToken } from '../entities/pad-local-token.entity';

@Injectable()
export class PadLocalTokenService {
  constructor(
    @InjectRepository(PadLocalToken)
    private padLocalTokenRepository: Repository<PadLocalToken>,
  ) {}

  async createToken(tokenValue: string): Promise<PadLocalToken> {
    const token = this.padLocalTokenRepository.create({ token: tokenValue });
    return this.padLocalTokenRepository.save(token);
  }

  async deactivateToken(tokenId: number): Promise<void> {
    await this.padLocalTokenRepository.update(tokenId, { isActive: false });
  }

  async getUnassignedToken(): Promise<PadLocalToken | null> {
    return this.padLocalTokenRepository.findOne({
      where: { wechatAccount: IsNull() },
    });
  }
}
