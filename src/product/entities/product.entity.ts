import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductTag } from 'src/product-tag/entities/product-tag.entity';
import { Photo } from 'src/upload/entities/photo.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { OrderItem } from 'src/order-item/entities/order-item';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal')
  price: number;

  @Column()
  quantity: number;

  @Column({ default: 0 }) 
  status: number;

  @OneToMany(() => ProductTag, (productTag) => productTag.product)
  productTags: ProductTag[];

  @OneToMany(() => Photo, (photo) => photo.imageable)
  photos: Photo[];

  @OneToMany(()=>OrderItem,orderItem=>orderItem.product)
   orderItems:OrderItem[]


  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Getter for easy access to tags through productTags
  get tags(): Tag[] {
    return this.productTags?.map(pt => pt.tag) ?? [];
  }
}
