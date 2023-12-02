import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PadLocalToken } from '../entities/pad-local-token.entity';

@Injectable()
export class PadLocalTokenService {
  constructor(
    @InjectRepository(PadLocalToken)
    private padLocalTokenRepository: Repository<PadLocalToken>,
    private dataSource: DataSource,
  ) {}

  async createToken(
    tokenValue: string,
    puppetType: string,
    ownerId: number,
  ): Promise<PadLocalToken> {
    const token = this.padLocalTokenRepository.create({
      token: tokenValue,
      puppetType,
      ownerId,
    });
    return this.padLocalTokenRepository.save(token);
  }

  async activateToken(tokenId: number): Promise<void> {
    const result = await this.padLocalTokenRepository.update(tokenId, {
      isActive: true,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Token with id ${tokenId} not found`);
    }
  }

  async cleanPadLocalOccupations() {
    await this.padLocalTokenRepository.update(
      {},
      {
        isOccupied: false,
      },
    );
  }

  async deactivateToken(tokenId: number): Promise<void> {
    await this.padLocalTokenRepository.update(tokenId, { isActive: false });
  }
  async getAllOccupiedToken(): Promise<PadLocalToken[]> {
    return this.padLocalTokenRepository.find({
      where: {
        isOccupied: true,
      },
    });
  }
  async getUnassignedToken(): Promise<PadLocalToken | null> {
    return this.dataSource.transaction(
      'SERIALIZABLE',
      async (entityManager) => {
        const token = await entityManager
          .getRepository(PadLocalToken)
          .createQueryBuilder('token')
          .setLock('pessimistic_write') // Using pessimistic locking
          // .leftJoinAndSelect('token.wechatAccount', 'account')
          // .where('account.id IS NULL')
          .where('token.isActive = :isActive', { isActive: true })
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
    return this.padLocalTokenRepository.find({
      relations: {
        wechatAccount: true,
      },
    });
  }

  async getOwnTokens(userId: number): Promise<PadLocalToken[]> {
    return this.padLocalTokenRepository.find({
      where: {
        ownerId: userId,
      },
      relations: {
        wechatAccount: true,
      },
    });
  }

  async getTokenById(id: number): Promise<PadLocalToken | null> {
    return this.padLocalTokenRepository.findOne({ where: { id } });
  }
}
