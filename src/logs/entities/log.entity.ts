// src/logs/entities/log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column({ nullable: true, type: 'text' })
  context?: string;

  @Column({ nullable: true, type: 'text' })
  stack?: string;

  @CreateDateColumn()
  created_at: Date;
}
