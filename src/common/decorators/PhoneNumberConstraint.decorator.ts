import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// Define a custom validation constraint for phone numbers
@ValidatorConstraint({ name: 'IsPhoneNumber', async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  
  validate(value: string, args: ValidationArguments) {
    // Define a regex pattern for phone number validation
    const phoneRegex = /^09\d{9}$/;  

    return typeof value === 'string' && phoneRegex.test(value); // Check if it matches the pattern
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} باید با 09 شروع شود و 11 رقم باشد`; // Error message in Persian (Farsi)
  }
}

// Custom decorator function
export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberConstraint,
    });
  };
}
