import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('open_ai_tokens')
export class OpenAIToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column({ default: true })
  isActive: boolean;
}
