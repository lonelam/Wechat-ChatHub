import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
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

  @Column({ name: 'gender' })
  gender: number;

  @Column({ name: 'alias' })
  alias: string;

  @ManyToMany(() => ChatSession, (session) => session.friends)
  sessions: ChatSession[];
}
