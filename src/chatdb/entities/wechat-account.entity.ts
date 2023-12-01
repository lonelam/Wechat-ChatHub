import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { PadLocalToken } from './pad-local-token.entity';
import { User } from './user.entity';

@Entity('wechat_accounts')
export class WechatAccount {
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

  @Column({ name: 'wechat_id' })
  wechatId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @OneToOne(() => PadLocalToken, (token) => token.wechatAccount, {
    nullable: true,
  })
  padLocalToken: PadLocalToken | null;

  @OneToMany(() => ChatSession, (session) => session.wechatAccount)
  sessions: ChatSession[];
}
