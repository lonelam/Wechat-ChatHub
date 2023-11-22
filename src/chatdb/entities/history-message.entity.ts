import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('history_messages')
export class HistoryMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    wechatId: string;

    @Column()
    type: string; // Assuming 'type' is a string describing the message type

    @Column({ name: 'text_content' })
    textContent: string;

    @Column()
    senderId: string; // Assuming sender is identified by a string (like a username or ID)

    @Column()
    receiverId: string; // Similarly for receiver

    @Column()
    source: string; // Source can be an identifier for where the message originated

    @ManyToOne(() => ChatSession, (session) => session.historyMessages)
    chatSession: ChatSession;
}
