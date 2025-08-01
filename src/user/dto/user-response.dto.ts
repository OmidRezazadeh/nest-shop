import {Expose } from 'class-transformer';


export class UserResponseDto {
  @Expose() 
  user:{ id:number ,email:string, phone:string , status:number}
  @Expose()
  image?: string;
  @Expose()
  role: { id: number; name: string };

  @Expose()
  profile?: { id: number; bio: string };




  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
