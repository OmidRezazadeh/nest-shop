import { Role } from "src/role/entities/role.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User{
    @PrimaryGeneratedColumn()
    id:number;

   @Column({unique:true})
   email:string

  @Column()
  password: string;


  @ManyToOne(()=>Role,(role)=>role.users)
  role:Role;
  

}