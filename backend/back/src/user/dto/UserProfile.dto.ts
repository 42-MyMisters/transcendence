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

    static fromUserEntity(user: User): UserProfileDto {
		const userProfileDto = new UserProfileDto();
		userProfileDto.uid = user.uid;
		userProfileDto.nickname = user.nickname;
        userProfileDto.profileUrl = user.profileUrl;
		userProfileDto.ELO = 0;
		userProfileDto.followings = user.followings.map((followUser) => FollowingUserDto.fromUser(followUser));
		return userProfileDto;
	}
}