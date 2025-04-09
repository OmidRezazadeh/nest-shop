// tag.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
