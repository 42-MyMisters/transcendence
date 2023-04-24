import { IsNotEmpty, IsString, Length, Validate } from "class-validator";
import { ForbiddenCharacter } from "../validator/forbidden-character.validator";


export class changeNicknameDto {
	@IsNotEmpty()
	@IsString()
	@Length(6, 16)
	@Validate(ForbiddenCharacter, ["#"])
	nickname: string;
}