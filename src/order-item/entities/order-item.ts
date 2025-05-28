import { Order } from "src/order/entities/order";
import {  Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from '../../product/entities/product.entity';

@Entity()
export class OrderItem{
 @PrimaryGeneratedColumn()
 id:number;

 @ManyToOne(() => Order, order => order.items)
 order: Order;

 @ManyToOne(()=> Product, product=>product.orderItems)
 product:Product;

 @Column()
 quantity:number;

 @Column()
 price:number;
}