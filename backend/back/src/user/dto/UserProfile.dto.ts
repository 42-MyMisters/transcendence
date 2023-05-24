import { Game } from "src/database/entity/game.entity";
import { UserFollow } from "src/database/entity/user-follow.entity";
import { User } from "../../database/entity/user.entity";
import { FollowingUserDto } from "./FollowingUser.dto";

export class UserProfileDto {
	uid: number;
	nickname: string;
	profileUrl: string;
	ELO: number;
	followings: FollowingUserDto[];
	games: Game[];
	wonGames: number;
	lostGames: number;
	totalGames: number;
	tfaEnabled: boolean;


	static async fromUserEntity(user: User, userFollowList: UserFollow[]): Promise<UserProfileDto> {
		const userProfileDto = new UserProfileDto();
		userProfileDto.uid = user.uid;
		userProfileDto.nickname = user.nickname;
		userProfileDto.profileUrl = user.profileUrl;
		userProfileDto.tfaEnabled = user.twoFactorEnabled;
		userProfileDto.ELO = user.elo;
		const followingUserDtos = await Promise.all(userFollowList.map(async (userFollow) => {
			return await FollowingUserDto.mapUserFollowToFollowingUserDto(userFollow);
		}));
		userProfileDto.followings = followingUserDtos;
		userProfileDto.wonGames = user.wonGames.length;
		userProfileDto.lostGames = user.lostGames.length;
		userProfileDto.totalGames = userProfileDto.wonGames + userProfileDto.lostGames;
		userProfileDto.games = this.mergeGames(user.wonGames, user.lostGames);
		return userProfileDto;
	}

	static mergeGames(wonGames: Game[] = [], lostGames: Game[] = []): Game[] {
		if (wonGames.length === 0 && lostGames.length === 0) {
		  return [];
		}

		if (wonGames.length > 0 && lostGames.length > 0) {
		  return [...wonGames, ...lostGames];
		}
	  
		if (wonGames.length > 0) {
		  return wonGames;
		}
	  
		return lostGames;
	  }
}
