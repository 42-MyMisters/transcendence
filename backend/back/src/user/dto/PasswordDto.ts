import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Match } from "./match.decorator";


export class PasswordDto {
  @IsString()
  @MinLength(8, {message: 'password is too short'})
  @MaxLength(20, {message: 'password is too long'})
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password is too weak'})
	password: string;
  
  @IsString()
  @Match('password', {message: 'password does not match'})
  passwordConfirm: string;
}