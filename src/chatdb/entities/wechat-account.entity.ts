import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { PadLocalToken } from './pad-local-token.entity';

@Entity('wechat_accounts')
export class WechatAccount {
  @PrimaryGeneratedColumn()
  id: number;

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
