import { Injectable } from '@nestjs/common';
import { UserService } from 'src/chatdb/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async hasInitialized(): Promise<boolean> {
    const roles = await this.userService.getAllRoles();
    return roles.length > 0;
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsername(username);
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
  }
}
