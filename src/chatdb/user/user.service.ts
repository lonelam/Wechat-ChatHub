import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { Friend } from '../entities/friend.entity';
import { OpenAIToken } from '../entities/open-ai-token.entity';
import { PadLocalToken } from '../entities/pad-local-token.entity';
import { WechatAccount } from '../entities/wechat-account.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(OpenAIToken)
    private readonly openAITokenRepository: Repository<OpenAIToken>,
    @InjectRepository(PadLocalToken)
    private readonly padLocalTokenRepository: Repository<PadLocalToken>,
    @InjectRepository(WechatAccount)
    private readonly wechatAccountRepository: Repository<WechatAccount>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async initializeRoles(): Promise<void> {
    for (const role of Object.values(UserRole)) {
      await this.roleRepository.save({
        name: role,
      });
    }
  }

  async intializeSuperUser(password: string): Promise<User> {
    let adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
      relations: {
        users: true,
      },
    });
    if (adminRole) {
      throw new ConflictException('Admin already exists');
    }
    await this.initializeRoles();
    adminRole = await this.roleRepository.findOne({
      where: { name: UserRole.ADMIN },
    });
    if (!adminRole) {
      throw new InternalServerErrorException('Admin role not found');
    }
    const superAdmin = await this.userRepository.save({
      username: 'admin',
      password,
      roles: [adminRole],
    });
    const updatePromises: Promise<UpdateResult>[] = [];
    updatePromises.push(
      this.chatSessionRepository.update(
        {
          ownerId: -1,
        },
        {
          ownerId: superAdmin.id,
        },
      ),
    );
    updatePromises.push(
      this.friendRepository.update(
        {
          ownerId: -1,
        },
        {
          ownerId: superAdmin.id,
        },
      ),
    );
    updatePromises.push(
      this.openAITokenRepository.update(
        {
          ownerId: -1,
        },
        {
          ownerId: superAdmin.id,
        },
      ),
    );
    updatePromises.push(
      this.padLocalTokenRepository.update(
        {
          ownerId: -1,
        },
        {
          ownerId: superAdmin.id,
        },
      ),
    );
    updatePromises.push(
      this.wechatAccountRepository.update(
        {
          ownerId: -1,
        },
        {
          ownerId: superAdmin.id,
        },
      ),
    );
    await Promise.all(updatePromises);
    return superAdmin;
  }
}
