import { Product } from 'src/product/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';


@Entity('photo')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  filename: string;

  @Column({ type: 'int', nullable: false })
  @Index()
  imageable_id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Index()
  imageable_type: string;

  @CreateDateColumn()
  created_at: Date;

  // Add this to reference the product (or other entities)
  @ManyToOne(() => Product, (product) => product.photos, { 
    onDelete: 'CASCADE',
    nullable: true 
  })
  @JoinColumn({ name: 'imageable_id' })
  imageable: Product;
}