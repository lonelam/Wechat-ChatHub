import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { WechatAccount } from './wechat-account.entity';
import { Friend } from './friend.entity';
import { HistoryMessage } from './history-message.entity';

const FeatureFlags = {
  GptCompletionFeature: 1 << 0,
  AutoReplyFeature: 1 << 1,
};
@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  conversationId: string;

  @ManyToOne(() => WechatAccount, (account) => account.sessions)
  @JoinColumn({ name: 'wechat_account_id' })
  wechatAccount: WechatAccount;

  @ManyToMany(() => Friend, (friend) => friend.sessions, {
    cascade: true,
  })
  @JoinTable()
  friends: Friend[];

  @Column('text', { name: 'summary_message', default: '' })
  summaryMessage: string;

  @Column('text', { name: 'system_message', default: '' })
  systemMessage: string;

  @Column('text', { name: 'active_message', default: '' })
  activeMessage: string;

  @Column('int', { name: 'feature_flags', default: 0 })
  featureFlags: number;

  get hasGptCompletionFeature(): boolean {
    return Boolean(this.featureFlags & FeatureFlags.GptCompletionFeature);
  }

  setGptCompletionFeature(): void {
    this.featureFlags |= FeatureFlags.GptCompletionFeature;
  }

  get hasAutoReplyFeature(): boolean {
    return Boolean(this.featureFlags & FeatureFlags.AutoReplyFeature);
  }

  @OneToMany(
    () => HistoryMessage,
    (historyMessage) => historyMessage.chatSession,
  )
  historyMessages: HistoryMessage[];
}
