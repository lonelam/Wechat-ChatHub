import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GrantedRoles } from './roles.decorator';
import { User, UserRole } from 'src/chatdb/entities/user.entity';
import { promisify } from 'util';
import { AuthService } from './auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let requiredRoles = this.reflector.get(GrantedRoles, context.getHandler());
    if (!requiredRoles) {
      requiredRoles = [UserRole.ADMIN];
    }
    const request: Express.Request = context.switchToHttp().getRequest();
    if (!request.isAuthenticated()) {
      throw new UnauthorizedException();
    }
    const user = request.user as User;
    if (!user) {
      await promisify(request.logOut)();
      throw new UnauthorizedException();
    }
    console.log(`the user is ${user}`);
    return matchRoles(requiredRoles, user.getUserRoles());
  }
}

function matchRoles(requiredRoles: UserRole[], userRoles: UserRole[]): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}
