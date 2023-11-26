import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { PadLocalToken } from '../entities/pad-local-token.entity';

@Injectable()
export class PadLocalTokenService {
  constructor(
    @InjectRepository(PadLocalToken)
    private padLocalTokenRepository: Repository<PadLocalToken>,
    private dataSource: DataSource,
  ) {}

  async createToken(tokenValue: string): Promise<PadLocalToken> {
    const token = this.padLocalTokenRepository.create({ token: tokenValue });
    return this.padLocalTokenRepository.save(token);
  }

  async activateToken(tokenId: number): Promise<void> {
    await this.padLocalTokenRepository.update(tokenId, {
      isActive: true,
    });
  }

  async cleanPadLocalOccupations(): Promise<void> {
    this.dataSource.transaction(async (entityManager) => {
      const occupations = await entityManager.find(PadLocalToken, {
        where: {
          isOccupied: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
        relations: ['wechatAccount'],
      });
      const savePromises = occupations.map(async (occupation) => {
        occupation.isOccupied = false;
        occupation.wechatAccount = null;
        return entityManager.save(occupation);
      });
      await Promise.all(savePromises);
    });
    await this.padLocalTokenRepository.update(
      {},
      {
        isOccupied: false,
        wechatAccount: null,
      },
    );
  }

  async deactivateToken(tokenId: number): Promise<void> {
    await this.padLocalTokenRepository.update(tokenId, { isActive: false });
  }
  async getUnassignedToken(): Promise<PadLocalToken | null> {
    return this.dataSource.transaction(
      'SERIALIZABLE',
      async (entityManager) => {
        const token = await entityManager
          .getRepository(PadLocalToken)
          .createQueryBuilder('token')
          .setLock('pessimistic_write') // Using pessimistic locking
          .leftJoinAndSelect('token.wechatAccount', 'account')
          .where('account.id IS NULL')
          .andWhere('token.isActive = :isActive', { isActive: true })
          .andWhere('token.isOccupied = :isOccupied', { isOccupied: false })
          .getOne();

        if (!token || token.isOccupied) {
          return null;
        }

        token.isOccupied = true;
        const result = await entityManager
          .getRepository(PadLocalToken)
          .createQueryBuilder('token')
          .update({ isOccupied: true })
          .execute(); // Using entityManager to save
        console.log(`result: ${JSON.stringify(result)}`);
        if (result.affected) {
          return token;
        }
        return null;
      },
    );
  }

  async getAllTokens(): Promise<PadLocalToken[]> {
    return this.padLocalTokenRepository.find();
  }

  async getTokenById(id: number): Promise<PadLocalToken | null> {
    return this.padLocalTokenRepository.findOne({ where: { id } });
  }
}
