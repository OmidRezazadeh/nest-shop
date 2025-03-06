import { Expose } from "class-transformer";

 export class RolesResponseDto{
    @Expose()
    id: string;
  
    @Expose()
    Name: string;
 }