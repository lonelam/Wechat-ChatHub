import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { WechatAccount } from './wechat-account.entity';
import { Friend } from './friend.entity';
import { HistoryMessage } from './history-message.entity';

const FeatureFlags = {
  GptCompletionFeature: 1 << 0,
  AutoReplyFeature: 1 << 1,
  FastAutoReplyFeature: 1 << 2,
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

  @ManyToOne(() => WechatAccount, (account) => account.sessions, {
    nullable: false,
  })
  @JoinColumn({
    name: 'wechat_account_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_chat_session_wechat_account',
  })
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

  get hasFastAutoReplyFeature(): boolean {
    return Boolean(this.featureFlags & FeatureFlags.FastAutoReplyFeature);
  }

  @OneToOne(
    () => HistoryMessage,
    (historyMessage) => historyMessage.replyingChatSession,
    {
      nullable: true,
      cascade: true,
    },
  )
  @JoinColumn({
    name: 'reply_owner_message_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_chat_session_reply_owner_message',
  })
  replyOwnerMessage: HistoryMessage | null;

  @OneToMany(
    () => HistoryMessage,
    (historyMessage) => historyMessage.chatSession,
  )
  historyMessages: HistoryMessage[];
}
