import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatSession } from './chat-session.entity';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'wechat_id' })
  wechatId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @OneToMany(() => ChatSession, (session) => session.friend)
  sessions: ChatSession[];
}
