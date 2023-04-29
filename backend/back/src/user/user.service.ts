import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import config from "config";
import { authenticator } from "otplib";
import { toDataURL } from 'qrcode';
import { DatabaseService } from "src/database/database.service";
import { UserFollow } from "src/database/entity/user-follow.entity";
import { User } from "src/database/entity/user.entity";
import { UserBlock } from "../database/entity/user-block.entity";
import { FollowingUserDto } from "./dto/FollowingUser.dto";
import { IntraUserDto } from "./dto/IntraUser.dto";
import { PasswordDto } from "./dto/Password.dto";
import { UserProfileDto } from "./dto/UserProfile.dto";


@Injectable()
export class UserService {
	constructor(
		private readonly databaseService: DatabaseService
	) { }


	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}

	async addNewUserTest(user: User) {
		return await this.databaseService.saveUser(user);
	}

	async addNewUser(intraUserDto: IntraUserDto): Promise<User> {
		const user: User = await User.fromIntraUserDto(intraUserDto);
		const createdUser = await this.databaseService.saveUser(user);
		if (this.isUserExist(createdUser))
			return createdUser;
		else
			throw new ForbiddenException('User Not Created');
	}

	async getUserByIntraDto(intraUserDto: IntraUserDto) {
		const findUser = await this.databaseService.findUserByUid(intraUserDto.id);
		if (this.isUserExist(findUser))
			return findUser;
		else {
			const newUser = await this.addNewUser(intraUserDto);
			return newUser;
		}
	}

	async getUserByUid(uid: number) {
		return await this.databaseService.findUserByUid(uid);
	}

	async getUserByNickname(nickname: string) {
		const findUser = await this.databaseService.findUserByNickname(nickname);
		if (this.isUserExist(findUser))
			return findUser;
		else
			throw new NotFoundException('user not found');
	}


	async showUsers() {
		return await this.databaseService.findAllUser();
	}

	async setUserNickname(user: User, changeNickname: string) {
		this.databaseService.updateUserNickname(user.uid, changeNickname);
	}

	async setUserRefreshToken(user: User, refresh_token: string) {
		const refreshTokenPayload = refresh_token.split('.')[1];
		const updatedRefreshToken = await bcrypt.hash(refreshTokenPayload, config.get<number>('hash.password.saltOrRounds'));
		await this.databaseService.updateUserRefreshToken(user.uid, updatedRefreshToken);
	}

	async setUserTwoFactorEnabled(user: User, isEnabled: boolean) {
		await this.databaseService.updateUserTwoFactorEnabled(user.uid, isEnabled);
	}

	//TODO :: THIS COULD BE setUserRefreshToken(user, null)?
	async deleteRefreshToken(uid: number) {
		await this.databaseService.updateUserRefreshToken(uid, null);
	}

	async setUserPw(user: User, pw: PasswordDto) {
		const cryptedPassword = await bcrypt.hash(pw.password, config.get<number>('hash.password.saltOrRounds'));
		await this.databaseService.updateUserPassword(user.uid, cryptedPassword);
	}

	async setUserProfileUrl(user: User, profileUrl: string) {
		this.databaseService.updateUserProfileImgUrl(user.uid, profileUrl)
	}

	async logout(user: User) {
		await this.deleteRefreshToken(user.uid);
	}
	// TODO ? ::  existingFollowing 조회없이, 바로 저장해보고 try catch 로 예외처리?
	async follow(curUser: User, userToFollow: User): Promise<void> {
		const existingFollowing = await this.databaseService.findFollowingByUid(curUser.uid, userToFollow.uid);
		if (existingFollowing) {
			throw new ConflictException('You are already following this user.');
		}

		const follow = new UserFollow();
		follow.fromUser = curUser;
		follow.targetToFollow = userToFollow;
		await this.databaseService.saveFollow(follow);
	}

	// TODO ? ::  existingFollowing 조회없이, 바로 저장해보고 try catch 로 예외처리?
	async unfollow(curUser: User, userToUnfollow: User): Promise<void> {
		await this.databaseService.deleteFollow(curUser.uid, userToUnfollow.uid);
	}

	async findAllBlock(curUser: User): Promise<UserBlock[] | null>{
		const blockList = await this.databaseService.findAllBlockByUid(curUser.uid);
		if (blockList.length === 0)
			return null;
		return blockList;
	}

	async block(curUser: User, userToBlock: User): Promise<void> {
		const existingUserBlock = await this.databaseService.findBlockByUid(curUser.uid, userToBlock.uid);
		if (existingUserBlock) {
			throw new Error('You are already blocked this user.');
		}
		const block = new UserBlock();
		block.fromUserId = curUser.uid;
		block.targetToBlock = userToBlock;
		await this.databaseService.saveBlock(block);
	}

	async unblock(curUser: User, userToUnblock: User): Promise<void> {
		await this.databaseService.deleteBlock(curUser.uid, userToUnblock.uid);
	}

	isTwoFactorEnabled(user: User) {
		return user.twoFactorEnabled;
	}

	async isTwoFactorCodeValid(twoFactorCode: string, user: User) {
		if (!user.twoFactorSecret) {
			return false;
		}
		return authenticator.verify({ token: twoFactorCode, secret: user.twoFactorSecret });
	}

	async genQrCodeURL(otpAuthUrl: string): Promise<{ data: string }> {
		return toDataURL(otpAuthUrl);
	}

	// Save 2fa secret, but twoFactorEnabled value does not change.
	async genTwoFactorSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(user.nickname, 'My Misters', secret);
		return { secret, qr: await this.genQrCodeURL(otpAuthUrl) };
	}

	async toggleTwoFactor(uid: number): Promise<Object | null> {
		const findUser = await this.databaseService.findUserByUid(uid);
		if (this.isUserExist(findUser)) {
			if (findUser.twoFactorEnabled) {
				await this.databaseService.updateUserTwoFactorEnabled(findUser.uid, false);
				return null;
			} else {
				const { secret, qr } = await this.genTwoFactorSecret(findUser);
				await this.databaseService.updateUserTwoSecret(findUser.uid, secret);
				return qr;
			}
		}
		throw new ForbiddenException('User Not Found!');
	}

	async validateUser(email: string, password: string) {
		const findUser = await this.databaseService.findUserByEmail(email);

		if (this.isUserExist(findUser)) {
			const isMatch = await bcrypt.compare(password, findUser.password);
			if (isMatch) {
				Logger.log(`User(${email}) login success.`);
				const { password, ...userWithoutPw } = findUser;
				return userWithoutPw;
			}
			throw new UnauthorizedException('Wrong password!');
		}
		throw new UnauthorizedException('User not found!');
	}


	async getUserWithFollowing(uid: number) {
		const user = await User.findOne({
			where: { uid },
			join: {
				alias: "user",
				leftJoinAndSelect: { follwings: "user.following" }
			}
		});
	}

	async getUserFollowing(uid: number): Promise<UserFollow[]> {
		const findFollowing = await this.databaseService.findAllFollowingByUid(uid);
		return findFollowing;
	}
	async getFollowingUserInfo(uid: number): Promise<FollowingUserDto[] | null> {
		const findFollowingUser = await this.getUserFollowing(uid);
		if (findFollowingUser.length === 0){
			return null;
		}
		const followingUserDtos = await Promise.all(findFollowingUser.map(async (userFollow) => {
			return await FollowingUserDto.mapUserFollowToFollowingUserDto(userFollow);
		}));
		return followingUserDtos;
	}

	async getUserProfile(uid: number): Promise<UserProfileDto>{
		const findUser = await this.databaseService.findUserByUid(uid);
		if (!this.isUserExist(findUser))
			throw new NotFoundException(`${uid} user not found`);
		const findFollwing = await this.getUserFollowing(uid);
		const userDto = await UserProfileDto.fromUserEntity(findUser, findFollwing);
		return userDto;
	}
	
	//GAME 조회
}
