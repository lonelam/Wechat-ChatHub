import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('open_ai_tokens')
export class OpenAIToken {
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

  @Column({ unique: true })
  token: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: '' })
  baseUrl: string;
}
