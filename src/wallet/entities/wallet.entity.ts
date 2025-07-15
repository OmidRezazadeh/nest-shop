import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,

} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { WalletStatus } from 'src/common/constants/wallet-status';
import { WalletType } from 'src/common/constants/wallet-type';



@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.PENDING,
  })
  status: WalletStatus;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.DEPOSIT,
  })
  type: WalletType;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];


  @CreateDateColumn()
  created_at: Date;
}
