import {
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';

export enum WalletStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 3,
}
export enum WalletType {
  DEPOSIT = 0,
  WITHDRAW = 1,
}
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', default: 0 })
  status: WalletStatus;

  @Column({ type: 'enum', default: 0 })
  type: WalletType;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
