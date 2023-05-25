import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'ForbiddenCharacter', async: false })
export class ForbiddenCharacter implements ValidatorConstraintInterface {

  validate(value: string, args: ValidationArguments) {
    if (value === undefined)
      return false;
    const [forbiddenChar] = args.constraints;
    return !value.includes(forbiddenChar);
  }

  defaultMessage(args: ValidationArguments) {
    const [forbiddenChar] = args.constraints;
    return `${forbiddenChar} is not allowed in the nickname.`;
  }
}
