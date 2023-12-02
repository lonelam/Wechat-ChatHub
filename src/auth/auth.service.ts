import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserDto } from 'src/chatdb/dto/user';
import { User } from 'src/chatdb/entities/user.entity';
import { OpenAITokenService } from 'src/chatdb/open-ai-token/open-ai-token.service';
import { PadLocalTokenService } from 'src/chatdb/pad-local-token/pad-local-token.service';
import { UserService } from 'src/chatdb/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private openAIToken: OpenAITokenService,
    private padLocalToken: PadLocalTokenService,
  ) {}

  async hasInitialized(): Promise<boolean> {
    const roles = await this.userService.getAllRoles();
    return roles.length > 0;
  }

  async getEmptySuperUser(): Promise<User | null> {
    const user = await this.userService.findUserByUsername('admin');
    if (!user?.password) {
      return user;
    }
    return null;
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findUserByUsername(username);
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }

  async register(username: string, pass: string): Promise<UserDto> {
    const user = await this.userService.findUserByUsername(username);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const newUser = await this.userService.createUser(username, pass);
    const result = new UserDto(newUser);
    return result;
  }

  async setup(
    adminPassword: string,
    openAiBaseUrl: string,
    openAiToken: string,
    wechatyToken: string,
    wechatyType: string,
  ) {
    const adminUser = await this.userService.intializeSuperUser(adminPassword);
    if (!adminUser) {
      throw new InternalServerErrorException('初始化管理员失败');
    }
    if (openAiBaseUrl && openAiToken) {
      const openAi = await this.openAIToken.addToken(
        openAiToken,
        openAiBaseUrl,
        adminUser.id,
      );
      if (!openAi) {
        throw new InternalServerErrorException('初始化openAi失败');
      }
    }
    if (wechatyToken && wechatyType) {
      const padLocalToken = this.padLocalToken.createToken(
        wechatyToken,
        wechatyType,
        adminUser.id,
      );
      if (!padLocalToken) {
        throw new InternalServerErrorException('初始化padLocalToken失败');
      }
    }

    return adminUser;
  }
}
