import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto{
    @ApiProperty({ description: 'User biography', example: 'I love shopping at this store.' })
    @IsString()
    bio:string;

    @ApiPropertyOptional({ description: 'Temporary image path or identifier to be moved into profile avatar', example: 'uploads/tmp/12345.png' })
    @IsOptional() 
    @IsString()
    image:string;
     
}