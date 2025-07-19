import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./Conversation.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
