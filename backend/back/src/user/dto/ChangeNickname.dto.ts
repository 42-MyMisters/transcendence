import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Validate } from "class-validator";
import { ForbiddenCharacter } from "../validator/forbidden-character.validator";


export class ChangeNicknameDto {
	@ApiProperty({
		description: 'New nickname for the user. Must be between 6 and 16 characters and cannot contain the "#" character.',
		example: 'newNickname123',
		minLength: 2,
		maxLength: 12,
	  })
	@IsNotEmpty()
	@IsString()
	@Length(2, 12)
	@Validate(ForbiddenCharacter, ["#"])
	nickname: string;
}