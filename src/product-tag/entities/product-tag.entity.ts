import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Tag } from 'src/tag/entities/tag.entity';

@Entity('product_tag')
@Unique(['product', 'tag'])
export class ProductTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Tag, (tag) => tag.productTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @CreateDateColumn()
  created_at: Date;
}
