import { Exclude, Expose } from 'class-transformer';


export class UserResponseDto {
  @Expose() 
  user:{ id:number ,email:string, phone:string}
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
