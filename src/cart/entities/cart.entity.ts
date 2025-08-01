
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('cart')
export class Cart{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column('decimal')
    total_price:number;
    
    @ManyToOne(()=> User,(user) => user.carts,{onDelete:'CASCADE'})
    @JoinColumn({name:'user_id'})
    user:User;

    @OneToMany(()=> CartItem,(cartItem)=>cartItem.cart,{cascade:true})
    items:CartItem[];

    @Column({ default: 0 }) 
    status:number;

    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;





}