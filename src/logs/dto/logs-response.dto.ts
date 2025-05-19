import { Expose } from "class-transformer";

export class LogResponseDto{
    @Expose()
    id: number;

    @Expose()
    level:string;


    @Expose()
    message:string;

    @Expose()
    context:string;

    @Expose()
    stack:string;

    @Expose()
    created_at:string

}