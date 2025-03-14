
import { Column, Entity ,PrimaryGeneratedColumn } from 'typeorm';

@Entity('confirmationCodes')
export class confirmationCode{
  @PrimaryGeneratedColumn()
  id:number;
    @Column({nullable:true})
    email:string;
    
    @Column({nullable:true})
    code:number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

}