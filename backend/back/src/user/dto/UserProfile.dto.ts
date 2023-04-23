import { Game } from "src/database/entity/game.entity";
import { User } from "../../database/entity/user.entity";
import { FollowingUserDto } from "./FollowingUser.dto";

export class UserProfileDto {
	uid: number;
	nickname: string;
    profileUrl: string;
    ELO: number;
    followings: FollowingUserDto[];
    games: Game;

	
    static async fromUserEntity(user: User): Promise<UserProfileDto> {
		const userProfileDto = new UserProfileDto();
		userProfileDto.uid = user.uid;
		userProfileDto.nickname = user.nickname;
        userProfileDto.profileUrl = user.profileUrl;
		// console.log(user.followings.entries); // undefined???
		// why lazy loading not working??
		userProfileDto.ELO = 0;
		return userProfileDto;
	}
}