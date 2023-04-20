import { Type } from "class-transformer";
import { validateOrReject } from "class-validator";
import { UserFollow } from "../user-follow.entity";

export class FollowingUserDto {
    uid : number;
    nickname: string;
    profileUrl: string;
    status: string;
    createdAt: Date; 

    static async mapUserFollowToFollowingUserDto(userFollow: UserFollow): Promise<FollowingUserDto> {
        const dto = new FollowingUserDto();
        dto.uid = userFollow.targetToFollow.uid;
        dto.nickname = userFollow.targetToFollow.nickname;
        dto.profileUrl = userFollow.targetToFollow.profileUrl;
        dto.createdAt = userFollow.createdAt;

        // validate DTO object using class-validator
        await validateOrReject(dto);
        return dto;
  }


    @Type(() => FollowingUserDto)
    followings?: FollowingUserDto[];
};