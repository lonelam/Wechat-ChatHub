import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { User } from './user.entity';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    nullable: true,
    cascade: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'owner_id',
    referencedColumnName: 'id',
  })
  owner: User | null;

  @Column({ name: 'owner_id', default: -1 })
  ownerId: number;

  @Column({
    name: 'wechat_id',
  })
  wechatId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @Column({ name: 'gender' })
  gender: number;

  @Column({ name: 'alias' })
  alias: string;

  @ManyToMany(() => ChatSession, (session) => session.friends)
  sessions: ChatSession[];
}
