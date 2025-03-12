import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { IsUniqueConstraintInput } from "./is-unique";
import { EntityManager } from 'typeorm';
import { Injectable } from "@nestjs/common";

@ValidatorConstraint({name:"IsEmailUniqueConstraint", async:true})
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface{
    constructor(
        private readonly entityManager:EntityManager
    ) {}
       async validate(
            value: any, 
            args?:ValidationArguments
        ):Promise<boolean> {
                const {tableName,column}:IsUniqueConstraintInput= args?.constraints[0];
                    const count = await this.entityManager.getRepository(tableName)
                    .createQueryBuilder(tableName).where({
                        [column]:value
                    }).getCount()
                 
                return count === 0;

        }
        defaultMessage(validationArguments?: ValidationArguments): string {
            const { column } = validationArguments?.constraints[0];
            return `این مقدار برای ${column} قبلاً استفاده شده است. لطفاً مقدار دیگری وارد کنید.`;
          }
          
}