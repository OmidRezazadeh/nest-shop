import { Expose, Type } from "class-transformer";
import { UserResponseDto } from "src/user/dto/user-response.dto";
import { MessageDto } from "./message.dto";

 export class ConversationDto{
    @Expose()
    id: string;
    @Type(()=>UserResponseDto)
    user:UserResponseDto
    
    @Expose()
    @Type(()=>UserResponseDto)
    admin:UserResponseDto
    
    @Expose()
    @Type(()=>MessageDto)
    messages:MessageDto

    @Expose()
    created_at:string;
    
 }