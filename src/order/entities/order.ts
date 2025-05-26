import { ORDER_STATUS } from 'src/common/constants/order-status';
import { OrderItem } from 'src/order-item/entities/order-item';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User, user=>user.orders)
  user: User;

  @OneToMany(()=> OrderItem, item=>item.order,{cascade:true})
  items:OrderItem[]

  @Column({ default: ORDER_STATUS.paid })
  status: number;

  @Column()
  total_price: number;

  @CreateDateColumn()
  created_at: Date;
}
