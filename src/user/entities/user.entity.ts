import { profile } from "console";
import { USER_STATUS } from "src/common/constants/user-status";
import { Profile } from "src/profile/entities/profile";
import { Role } from "src/role/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity('users')
export class User{
  @PrimaryGeneratedColumn()
  id:number;

  @Column({unique:true})
  email:string

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name:string;

  @Column()
  password: string;

  @Column({ default: USER_STATUS.INACTIVE })
  status: number;
  
  @Column({ nullable: true })
  phone:string;

  @Column({ nullable: true }) 
  refreshToken: string ;

  @Column({ name: 'role_id' })
  role_id: number;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
  
  @OneToOne(()=> Profile,(profile)=>profile.user)
  profile:Profile; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


}