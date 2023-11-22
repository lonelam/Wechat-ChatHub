import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { WechatAccount } from './wechat-account.entity';
import { Friend } from './friend.entity';
import { HistoryMessage } from './history-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WechatAccount, (account) => account.sessions)
  @JoinColumn({ name: 'wechat_account_id' })
  wechatAccount: WechatAccount;

  @ManyToOne(() => Friend, (friend) => friend.sessions)
  @JoinColumn({ name: 'friend_id' })
  friend: Friend;

  @Column('text', { name: 'summary_message' })
  summaryMessage: string;

  @Column('text', { name: 'system_message' })
  systemMessage: string;

  @OneToMany(() => HistoryMessage, (historyMessage) => historyMessage.chatSession)
  historyMessages: HistoryMessage[];
}
