import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GrantedRoles, Public } from './roles.decorator';
import { UserRole } from 'src/chatdb/entities/user.entity';
import { promisify } from 'util';
import { AuthService } from './auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    let requiredRoles = this.reflector.get(GrantedRoles, context.getHandler());
    if (!requiredRoles) {
      requiredRoles = [UserRole.ADMIN];
    }

    const request: Express.Request = context.switchToHttp().getRequest();
    const emptyAdmin = await this.authService.getEmptySuperUser();
    if (emptyAdmin) {
      await promisify(request.logIn.bind(request))(emptyAdmin);
    }

    if (!request.isAuthenticated()) {
      throw new UnauthorizedException();
    }
    const user = request.user;
    if (!user) {
      await promisify(request.logOut.bind(request))();
      throw new UnauthorizedException();
    }
    // console.log(`the user is ${user}`);
    return matchRoles(
      requiredRoles,
      user.roles.map((role) => role.name),
    );
  }
}

function matchRoles(requiredRoles: UserRole[], userRoles: UserRole[]): boolean {
  if (userRoles.includes(UserRole.ADMIN)) {
    return true;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
}
