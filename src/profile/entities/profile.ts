import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';


@Entity('profiles')
export class Profile{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({ nullable: true })
    bio:string

    @Column({ nullable: true })
    image:string;

    @OneToOne(()=>User)
    @JoinColumn()
    user:User;
    

}