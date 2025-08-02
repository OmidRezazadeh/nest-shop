import { Cart } from 'src/cart/entities/cart.entity';
import { USER_STATUS } from 'src/common/constants/user-status';
import { Order } from 'src/order/entities/order';
import { Profile } from 'src/profile/entities/profile';
import { Role } from 'src/role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Conversation } from 'src/chat/entities/Conversation.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  password: string;

  @Column({ default: USER_STATUS.INACTIVE })
  status: number;

  @Column({ nullable: true })
  phone: string;

@Column({ type: 'text', nullable: true })
refreshToken: string | null;

  @Column({ name: 'role_id' })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];


  @OneToMany(() => Conversation, (conversation) => conversation.admin)
  assignedConversations: Conversation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
