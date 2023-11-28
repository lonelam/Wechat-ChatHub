import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('history_messages')
export class HistoryMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  wechatId: string;

  @Column()
  type: number; // Assuming 'type' is a string describing the message type

  @Column('text', { name: 'text_content' })
  textContent: string;

  @Column()
  senderId: string; // Assuming sender is identified by a string (like a username or ID)

  @Column()
  receiverId: string; // Similarly for receiver

  @Column()
  source: string; // Source can be an identifier for where the message originated

  @Column('timestamp', { name: 'send_time' })
  sendTime: Date;

  @ManyToOne(() => ChatSession, (session) => session.historyMessages, {
    nullable: false,
  })
  @JoinColumn({
    name: 'chat_session_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_chat_session_history_message',
  })
  chatSession: ChatSession;

  @OneToOne(() => ChatSession, (session) => session.replyOwnerMessage, {
    nullable: true,
  })
  @JoinColumn({
    name: 'replying_chat_session_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_replying_chat_session_history_message',
  })
  replyingChatSession: ChatSession | null;
}
