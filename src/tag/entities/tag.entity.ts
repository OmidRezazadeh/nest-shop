import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { ProductTag } from 'src/product-tag/entities/product-tag.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductTag, (productTag) => productTag.tag)
  productTags: ProductTag[];

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];
}
