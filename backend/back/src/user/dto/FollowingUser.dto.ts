import { UserFollow } from "../user-follow.entity";
import { User } from "../user.entity";

export class FollowingUserDto {
    uid : number;
    nickname: string;
    profileUrl: string;
    status: string;
    createdAt: Date; 

    static fromUser(follwingUser: UserFollow): FollowingUserDto {
		const followUserDto = new FollowingUserDto();
        const user = follwingUser.fromUser;
		followUserDto.uid = user.uid
		followUserDto.nickname = user.nickname;
		followUserDto.profileUrl = user.profileUrl;
        followUserDto.createdAt = follwingUser.createdAt;
		// followUserDto.status = 
		return followUserDto;
	}
};