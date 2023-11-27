import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getAllWechatAccounts(): Promise<WechatAccount[]> {
    return this.wechatAccountRepository.find();
  }

  async getOrCreateWechatAccount(
    wechatId: string,
    name: string,
    avatarUrl: string,
  ): Promise<WechatAccount> {
    const wechatAccount = await this.wechatAccountRepository.findOne({
      where: { wechatId },
    });
    if (wechatAccount) {
      return wechatAccount;
    } else {
      const wechatAccount = this.wechatAccountRepository.create({
        wechatId,
        name,
        avatarUrl,
      });
      return this.wechatAccountRepository.save(wechatAccount);
    }
  }

  async getWechatAccountByWechatId(wechatId: string) {
    return this.wechatAccountRepository.findOne({
      where: { wechatId },
    });
  }

  async createWechatAccount(
    wechatId: string,
    name: string,
    avatarUrl: string,
  ): Promise<WechatAccount> {
    const wechatAccount = this.wechatAccountRepository.create({
      wechatId,
      name,
      avatarUrl,
    });
    return this.wechatAccountRepository.save(wechatAccount);
  }

  async bindAccountToToken(
    wechatId: string,
    tokenId: string,
  ): Promise<WechatAccount> {
    const wechatAccount = await this.wechatAccountRepository.findOne({
      where: { wechatId },
    });
    const token = await this.padLocalTokenRepository.findOne({
      where: { token: tokenId },
    });

    if (wechatAccount && token) {
      wechatAccount.padLocalToken = token;
      return this.wechatAccountRepository.save(wechatAccount);
    }

    throw new NotFoundException('Wechat account or token not found');
  }

  async unbindAccountFromToken(wechatId: string, tokenId: string) {
    const wechatAccount = await this.wechatAccountRepository.findOne({
      where: { wechatId },
    });
    const token = await this.padLocalTokenRepository.findOne({
      where: { token: tokenId },
    });
    if (wechatAccount && token) {
      wechatAccount.padLocalToken = null;
      token.wechatAccount = null;
      await this.wechatAccountRepository.save(wechatAccount);
      await this.padLocalTokenRepository.save(token);
      // await this.padLocalTokenRepository.remove(token);
      return;
    }
    throw new NotFoundException('Wechat account or token not found');
  }

  // Additional methods as needed...
}
