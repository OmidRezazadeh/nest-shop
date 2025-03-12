import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsUniqueConstraint } from './is-unique-constraint';

export type IsUniqueConstraintInput = {
  tableName: string;
  column: string;
};

export function IsUnique(
  options: IsUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'is-unique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}