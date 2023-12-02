import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

export enum UserRole {
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
  ANONYMOUS = 'anonymous',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column()
  password: string; // Store a hashed password

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
