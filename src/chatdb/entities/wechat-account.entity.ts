import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { PadLocalToken } from './pad-local-token.entity';

@Entity('wechat_accounts')
export class WechatAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'wechat_id' })
  wechatId: string;

  @OneToOne(() => PadLocalToken, (token) => token.wechatAccount)
  @JoinColumn({ name: 'pad_local_token_id' })
  padLocalToken: PadLocalToken;

  @OneToMany(() => ChatSession, (session) => session.wechatAccount)
  @JoinColumn({ name: 'chat_session_id' })
  sessions: ChatSession[];
}
