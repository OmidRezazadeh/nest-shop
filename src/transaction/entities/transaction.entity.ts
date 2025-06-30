import { User } from 'src/user/entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  wallet: Wallet; 

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
  @Column({ type: 'varchar', length: 50 })
  gateway: string; 

  @Column({ type: 'varchar', length: 100 })
  authority: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ref_id: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;


  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

}
