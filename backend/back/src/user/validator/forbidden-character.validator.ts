import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'ForbiddenCharacter', async: false })
export class ForbiddenCharacter implements ValidatorConstraintInterface {

  validate(value: string, args: ValidationArguments) {
    const [forbiddenChar] = args.constraints;
    return !value.includes(forbiddenChar);
  }

  defaultMessage(args: ValidationArguments) {
    const [forbiddenChar] = args.constraints;
    return `${forbiddenChar} is not allowed in the nickname.`;
  }
}
