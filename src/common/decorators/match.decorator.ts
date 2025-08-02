import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'Match', async: false })
export class MatchConstraint implements ValidatorConstraintInterface{

    validate(value:any, args: ValidationArguments){
       const [relatedPropertyName]  = args.constraints;
       const relatedValue=(args.object)[relatedPropertyName];
       return value === relatedValue; // Fix: Use strict comparison
    }
    defaultMessage(args: ValidationArguments) {
        return `${args.property} باید با ${args.constraints[0]} مطابقت داشته باشد`; // Error message in Persian (Farsi).
    }

}
export function Match(property:string ,validationOptions?: ValidationOptions){
    return function (object: Object, propertyName: string) {
        registerDecorator({
          target: object.constructor, // The class where the decorator is used.
          propertyName, // The field that the decorator is applied to.
          options: validationOptions, // Custom validation options (e.g., error messages).
          constraints: [property], // Stores the related property name to be used in validation.
          validator: MatchConstraint, // Uses the `MatchConstraint` class for validation logic.
        });
      };

}
