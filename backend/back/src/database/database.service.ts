import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserFollow } from "src/database/entity/user-follow.entity";
import { User } from "src/database/entity/user.entity";
import { GameType } from "src/game/game.enum";
import { DataSource, Repository } from "typeorm";
import { DirectMessage } from "./entity/direct-message.entity";
import { Game } from "./entity/game.entity";
import { UserBlock } from "./entity/user-block.entity";


@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserFollow) private userFollowRepository: Repository<UserFollow>,
        @InjectRepository(UserBlock) private userBlockRepository: Repository<UserBlock>,
        @InjectRepository(Game) private gameRepository: Repository<Game>,
        @InjectRepository(DirectMessage) private directMessageRepository: Repository<DirectMessage>,
        private dataSource: DataSource,
    ) { }

    //USER CREATE
    async saveUser(user: User): Promise<User> {
        return await this.userRepository.save(user);
    }

    // USER READ
    async findAllUser(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findUserByUid(uid: number): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ uid });
        return user;
    }

    async findUserByNickname(nickname: string): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ nickname });
        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.userRepository.findOneBy({ email });
        return user;
    }

    async findUserWithFollowing(uid: number): Promise<User[]> {
        const user = await this.userRepository.find({
            relations: {
                followings: true,
            },
            where: {
                uid
            }
        });
        return user;
    }

    // USER , Games JOIN READ
    async findUserData(uid: number): Promise<User | null> {
        const findUser = await this.userRepository.findOne({
            relations: {
                wonGames: true,
                lostGames: true,
            },
            where: {uid}
        });
        return findUser;
    }


    // USER UPDATE
    async updateUser(user: User) {
        await this.userRepository.save(user);
    }

    async updateUserElo(uid: number, elo: number): Promise<void> {
        try {
            await this.userRepository.update({ uid }, { elo });
        } catch (error) {
            throw new BadRequestException('elo update error');
        }
    }

    async updateUserNickname(uid: number, nickname: string): Promise<void> {
        try {
            await this.userRepository.update({ uid }, { nickname });
        } catch (error) {
            throw new BadRequestException('nickname already exists');
        }
    }

    async updateUserRefreshToken(uid: number, refreshToken: string | null) {
        try {
            await this.userRepository.update({ uid }, { refreshToken });
        } catch (error) {
            throw new BadRequestException(`refreshTokenUpdate Error + ${error}`);
        }
    }

    async updateUserPassword(uid: number, password: string) {
        await this.userRepository.update({ uid }, { password });
    }

    async updateUserProfileImgUrl(uid: number, profileUrl: string) {
        await this.userRepository.update({ uid }, { profileUrl });
    }

    async updateUserTwoFactorEnabled(uid: number, twoFactorEnabled: boolean) {
        await this.userRepository.update({ uid }, { twoFactorEnabled });
    }
    async updateUserTwoSecret(uid: number, twoFactorSecret: string) {
        await this.userRepository.update({ uid }, { twoFactorSecret });
    }


    // USER DELETE
    async deleteUser(uid: number) {
        return await this.userRepository.delete({ uid });
    }


    // USER-FOLLOW CREATE
    async saveFollow(userFollow: UserFollow): Promise<UserFollow> {
        return await this.userFollowRepository.save(userFollow);
    }

    // USER-FOLLOW READ
    async findFollowingByUid(fromUid: number, toUid: number): Promise<UserFollow | null> {
        return await this.userFollowRepository.findOne({ where: { fromUserId: fromUid, targetToFollowId: toUid } });
    }

    async findAllFollowingByUid(fromUserId: number) {
        return await this.userFollowRepository.find({
            where: { fromUserId },
            relations: ['targetToFollow'],
        });
    }

    // USER-FOLLOW UPDATE


    // USER-FOLLOW DELETE
    async deleteFollow(fromUid: number, toUid: number) {
        // await this.userFollowRepository.remove(userFollow);
        const result = await this.userFollowRepository.delete({ fromUserId: fromUid, targetToFollowId: toUid });
        if (result.affected === 0) {
            throw new NotFoundException("already unfollowed");
        }
    }

    // USER-BLOCK CREATE
    async saveBlock(userBlock: UserBlock): Promise<UserBlock> {
        return await this.userBlockRepository.save(userBlock);
    }

    // USER-BLOCK READ
    async findBlockByUid(fromUid: number, toUid: number): Promise<UserBlock | null> {
        return await this.userBlockRepository.findOne({ where: { fromUserId: fromUid, targetToBlockId: toUid } });
    }

    // USER-BLOCK LIST
    async findAllBlockByUid(fromUid: number): Promise<UserBlock[]> {
        return await this.userBlockRepository.find({ where: { fromUserId: fromUid } });
    }

    // USER-BLOCK DELETE
    async deleteBlock(fromUid: number, toUid: number) {
        // await this.userBlockRepository.remove(userBlock);
        const result = await this.userBlockRepository.delete({ fromUserId: fromUid, targetToBlockId: toUid });
        if (result.affected === 0) {
            throw new NotFoundException("already unblocked");
        }
    }


    // Direct Message

    async findDMById(did: number): Promise<DirectMessage | null> {
        return await this.directMessageRepository.findOne({ where: { did } });
    }

    // is this neccesary?
    async findDMByUserId(senderId: number): Promise<DirectMessage[] | null> {
        return await this.directMessageRepository.find({ where: { senderId } });
    }

    async findDMByUserIdReceive(receiverId: number): Promise<DirectMessage[] | null> {
        return await this.directMessageRepository.find({ where: { receiverId } });
    }


    async saveDM(dm: DirectMessage) {
        return await this.directMessageRepository.save(dm);
    }

    async findDMSenderAndReceiver(senderId: number, receiverId: number): Promise<DirectMessage[] | null> {
        return await this.directMessageRepository
            .createQueryBuilder('dm')
            .where('dm.senderId = :senderId', { senderId })
            .andWhere('dm.receiverId = :receiverId', { receiverId })
            .getMany();
    }

    async findAllDM(uid: number): Promise<DirectMessage[] | null> {
        return await this.directMessageRepository
            .createQueryBuilder('dm')
            .where('dm.senderId = :senderId', { senderId: uid })
            .orWhere('dm.receiverId = :receiverId', { receiverId: uid })
            .getMany();
    }

    //player 1 uid, player 2 uid, score 1, score 2, gametype
    // async saveGame(gameResult : Game){
    //     return await this.gameRepository.save(gameResult);
    // }

    async saveGame(result: Game, gameType: GameType, winnerElo: number, loserElo: number) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(Game, result);
            if (gameType === GameType.PUBLIC) {
                await queryRunner.manager.update(User, { uid: result.winner.uid }, { elo: winnerElo });
                await queryRunner.manager.update(User, { uid: result.loser.uid }, { elo: loserElo });
            }
            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }


    //GAME
    async findAllGameByUserid(uid: number) {
        const games = await this.gameRepository.createQueryBuilder('gm')
            .where('gm.winner.uid = :uid', { uid }).orWhere('gm.loser.uid = :uid', { uid }).getMany();
        return games;
    }

     
    async getLeaderboard() {
        const foundUsers = await this.userRepository.find({
            relations: {
                wonGames: true,
                lostGames: true,
            },
            order: {
                elo: 'DESC',
              },
              take: 10,
        });

        const leaderboardDto = foundUsers.map((user) => (
        {
          nickname: user.nickname,
          elo: user.elo,
          winGameCount: user.wonGames.length,
          lostGameCount: user.lostGames.length,
          totalGameCount: user.wonGames.length + user.lostGames.length
        }
        ));
      
        return leaderboardDto;
      }
      

}
