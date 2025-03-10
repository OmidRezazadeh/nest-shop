import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('roles')
export class Role{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    name:string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];  
}