import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from './Message.entity';


@Entity()
export class Conversation  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isClosed: boolean;

  @ManyToOne(() => User, (user) => user.conversations)
  user: User;

  @ManyToOne(() => User, (admin) => admin.assignedConversations, { nullable: true })
  admin: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
  @CreateDateColumn()
  created_at: Date;
}