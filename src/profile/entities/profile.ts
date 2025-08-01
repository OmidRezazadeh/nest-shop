import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity('profiles')
export class Profile{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({ nullable: true })
    bio:string

    @Column({name:'user_id'})
    user_id:number;
    @OneToOne(()=>User)
    @JoinColumn({ name:'user_id'})
    user:User;
    

}