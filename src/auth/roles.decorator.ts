import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/chatdb/entities/user.entity';

export const GrantedRoles = Reflector.createDecorator<UserRole[]>();
export const Public = Reflector.createDecorator<boolean>({});
