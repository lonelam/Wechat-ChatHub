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
import { HistoryMessage } from '../entities/history-message.entity';

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
    @InjectRepository(HistoryMessage)
    private readonly historyMessageRepository: Repository<HistoryMessage>,
  ) {}

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async createUser(username: string, password: string): Promise<User> {
    const availableRoles = await this.getAllRoles();
    if (availableRoles.length === 0) {
      throw new InternalServerErrorException('No roles found');
    }
    const normalRole = availableRoles.find(
      (role) => role.name === UserRole.NORMAL_USER,
    ) as Role;

    return await this.userRepository.save({
      username,
      password,
      role: [normalRole],
    });
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
    updatePromises.push(
      this.historyMessageRepository.update(
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
