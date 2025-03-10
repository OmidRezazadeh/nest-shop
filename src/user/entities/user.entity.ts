import { profile } from "console";
import { USER_STATUS } from "src/common/constants/user-status";
import { Profile } from "src/profile/entities/profile";
import { Role } from "src/role/entities/role.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    id:number;

  @Column({unique:true})
  email:string

  @Column()
  password: string;

  @Column({ default: USER_STATUS.INACTIVE }) // Default status is 0
  status: number;
  
  @Column()
  phone:string;

  @ManyToOne(()=>Role,(role)=>role.users)
  role:Role;
  
  @OneToOne(()=> Profile,(profile)=>profile.user)
  profile:Profile; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}