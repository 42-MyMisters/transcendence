import { BadRequestException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/database/entity/user.entity";
import { DataSource, Repository } from "typeorm";
import { Game } from "./entity/game.entity";
import { UserFollow } from "src/database/entity/user-follow.entity";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserFollow) private userFollowRepository: Repository<UserFollow>,
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        private dataSource: DataSource,
    ) {}

    //USER CREATE
    async saveUser(user: User): Promise<User>{
        return await this.userRepository.save(user);
    }
    
    // USER READ
    async findAllUser(): Promise<User[]>{
        return await this.userRepository.find();
    }
    // THIS MIGHT NOT WORK
    async findAllUsersWithGames(): Promise<User[]> {
        const users = await this.userRepository.find({ relations: ["wonGames", "lostGames", "followers", "followings"] });
        return users;
    }
    
    async findUserByUid(uid: number): Promise<User | null>{
        const user = await this.userRepository.findOneBy({uid});
        return user;
    }
    
    async findUserByNickname(nickname: string): Promise<User | null> {
		const user = await this.userRepository.findOneBy({nickname});
		return user;
    }

    async findUserByEmail(email: string): Promise<User | null>{
        const user = await this.userRepository.findOneBy({email});
		return user;
    }


    // USER UPDATE
    async updateUser(user: User){
        await this.userRepository.save(user);
    }
    
    async updateUserNickname(uid: number, nickname: string){
        try{
            await this.userRepository.update({uid}, {nickname});
        } catch (error) {
            throw new ForbiddenException('nickname already exists');
        }
    }

    async updateUserRefreshToken(uid: number, refreshToken: string | null){
        try {
            await this.userRepository.update({uid},{refreshToken});
        } catch (error){
            throw new BadRequestException(`refreshTokenUpdate Error + ${error}`);
        }
    }

    async updateUserPassword(uid: number, password: string){
        await this.userRepository.update({uid}, {password});
    }

    async updateUserProfileImgUrl(uid: number, profileUrl: string ){
        await this.userRepository.update({uid}, {profileUrl});
    }

    async updateUserTwoFactorEnabled(uid: number,  twoFactorEnabled: boolean){
        await this.userRepository.update({uid}, {twoFactorEnabled});
    }
    async updateUserTwoSecret(uid: number,  twoFactorSecret: string){
        await this.userRepository.update({uid}, {twoFactorSecret});
    }


    // USER DELETE
    async deleteUser(uid: number){
        return await this.userRepository.delete({uid});
    }



    // USER-FOLLOW CREATE
    async saveFollow(userFollow: UserFollow): Promise<UserFollow>{
        return await this.userFollowRepository.save(userFollow);
    }

    // USER-FOLLOW READ
    async findFollowingByUid(fromUid: number, toUid: number): Promise<UserFollow | null>{
        return await this.userFollowRepository.findOne({ where : { fromUserId: fromUid, targetToFollowId: toUid } });
    }

    // USER-FOLLOW UPDATE
    

    // USER-FOLLOW DELETE
    async deleteFollow(userFollow: UserFollow){
        await this.userFollowRepository.remove(userFollow);
    }



    //GAME

}