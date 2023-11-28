import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { WechatAccount } from './wechat-account.entity';

@Entity('pad_local_tokens')
export class PadLocalToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @OneToOne(() => WechatAccount, (account) => account.padLocalToken, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn({
    name: 'wechat_account_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'pad_local_token_wechat_account_fk',
  })
  wechatAccount: WechatAccount | null;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    default: false,
  })
  isOccupied: boolean;
}
