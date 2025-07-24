import { Expose, Type } from "class-transformer";
import { UserResponseDto } from "src/user/dto/user-response.dto";

 export class clientMessageDto{
    @Expose()
    id: string;
    @Expose()
    message:string;
    @Expose()
    created_at:string;
    @Expose()
    conversation_id:number;
    @Expose()
    @Type(()=>UserResponseDto)
    user:UserResponseDto
    
 }