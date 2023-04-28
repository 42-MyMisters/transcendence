import { IsNotEmpty, IsString, Length, Validate } from "class-validator";
import { ForbiddenCharacter } from "../validator/forbidden-character.validator";
import { ApiProperty } from "@nestjs/swagger";


export class changeNicknameDto {
	@ApiProperty({
		description: 'New nickname for the user. Must be between 6 and 16 characters and cannot contain the "#" character.',
		example: 'newNickname123',
		minLength: 6,
		maxLength: 16,
	  })
	@IsNotEmpty()
	@IsString()
	@Length(6, 16)
	@Validate(ForbiddenCharacter, ["#"])
	nickname: string;
}