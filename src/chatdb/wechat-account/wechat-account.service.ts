import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WechatAccount } from '../entities/wechat-account.entity';
import { PadLocalToken } from '../entities/pad-local-token.entity';

@Injectable()
export class WechatAccountService {
  constructor(
    @InjectRepository(WechatAccount)
    private wechatAccountRepository: Repository<WechatAccount>,
    @InjectRepository(PadLocalToken)
    private padLocalTokenRepository: Repository<PadLocalToken>,
  ) {}

  async createWechatAccount(wechatId: string): Promise<WechatAccount> {
    const wechatAccount = this.wechatAccountRepository.create({ wechatId });
    return this.wechatAccountRepository.save(wechatAccount);
  }

  async bindAccountToToken(
    wechatAccountId: number,
    tokenId: number,
  ): Promise<WechatAccount> {
    const wechatAccount = await this.wechatAccountRepository.findOne({
      where: { id: wechatAccountId },
    });
    const token = await this.padLocalTokenRepository.findOne({
      where: { id: tokenId },
    });

    if (wechatAccount && token) {
      wechatAccount.padLocalToken = token;
      return this.wechatAccountRepository.save(wechatAccount);
    }

    throw new Error('WechatAccount or PadLocalToken not found');
  }

  // Additional methods as needed...
}
