import { Order } from 'src/order/entities/order';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;
  
  @RelationId((item: OrderItem) => item.order)
  orderId: number;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @RelationId((item: OrderItem) => item.product)
  productId: number;

  @Column()
  quantity: number;

  @Column()
  price: number;
}
