import { Cart } from 'src/cart/entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    UpdateDateColumn,
  } from 'typeorm';

  @Entity('cart_item')
  export class CartItem{
    @PrimaryGeneratedColumn()
    id: string;


  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

    
    @Column({type:"decimal", precision:10,scale:2})
    price:number;


    @Column({ type: 'int' })
    quantity: number;

    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }

