import { User } from "../../database/entity/user.entity";

export class UserProfileDto {
	uid: number;
	nickname: string;
	profileUrl: string;
	ELO: number;
	tfaEnabled: boolean;

	static async fromUserEntity(user: User): Promise<UserProfileDto> {
		const userProfileDto = new UserProfileDto();
		userProfileDto.uid = user.uid;
		userProfileDto.nickname = user.nickname;
		userProfileDto.profileUrl = user.profileUrl;
		userProfileDto.tfaEnabled = user.twoFactorEnabled;
		userProfileDto.ELO = user.elo;
		return userProfileDto;
	}
}
