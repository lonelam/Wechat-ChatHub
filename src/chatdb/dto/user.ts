import { User, UserRole } from '../entities/user.entity';

export class UserDto {
  id: number;

  username: string;

  isActive: boolean;

  userRoles: UserRole[];

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.isActive = user.isActive;
    this.userRoles = user.roles.map((r) => r.name as UserRole);
  }
}
