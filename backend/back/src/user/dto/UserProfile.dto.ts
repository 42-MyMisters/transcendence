import { Game } from "src/game/game.entity";
import { UserFollow } from "../user-follow.entity";
import { User } from "../user.entity";
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
		console.log(user.followings.entries); // undefined???
		// why lazy loading not working??
		if (Array.isArray(user.followings)) {
			userProfileDto.followings = user.followings.map((followUser) => FollowingUserDto.fromUser(followUser));

		} 
		else {
			userProfileDto.followings = [];
		}
		userProfileDto.ELO = 0;
		return userProfileDto;
	}
}