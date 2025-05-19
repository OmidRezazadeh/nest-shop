import { IsOptional, IsPositive } from "class-validator";

export class ListLogDto{
    @IsOptional()
    @IsPositive()
    page?: number;

    @IsOptional()
    @IsPositive()
    limit?: number;


    @IsOptional()
    level?:string;

    @IsOptional()
    context?:string;


}