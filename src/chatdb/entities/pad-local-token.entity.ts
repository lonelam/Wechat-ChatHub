import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { WechatAccount } from './wechat-account.entity';
import { User } from './user.entity';

@Entity('pad_local_tokens')
export class PadLocalToken {
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

  @Column({
    default: 'wechaty-puppet-padlocal',
  })
  puppetType: string;
}
