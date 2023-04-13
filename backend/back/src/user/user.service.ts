import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import config from "config";
import { AuthService } from "src/auth/auth.service";
import { Repository } from "typeorm";
import { IntraUserDto } from "./dto/IntraUser.dto";
import { PasswordDto } from "./dto/Password.dto";
import { UserFollow } from "./user-follow.entity";
import { User } from "./user.entity";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserFollow)
		private userFollowRepository: Repository<UserFollow>,
		private authService: AuthService
	){}

	async addNewUser(intraUserDto: IntraUserDto): Promise<User> {
		const user: User = await User.fromIntraUserDto(intraUserDto);
		await this.userRepository.save(user);
		return user;
	}

	async getUserByIntraDto(userData: IntraUserDto){
		const user = await this.getUserById(userData.id);
		if (this.isUserExist(user))
			return user;
		else {
			const newUser = await this.addNewUser(userData);
			return newUser
		}
	}

	async getUserById(uid: number) {
		const user = await this.userRepository.findOneBy({uid});
		return user;
	}

	async getUserByEmail(email: string) {
		const user = await this.userRepository.findOneBy({email});
		return user;
	}

	async showUsers() {
		const users = await this.userRepository.find({ relations: ["wonGames", "lostGames", "followers", "followings"] });
		return users;
	}

	async setUserRefreshToken(user: User, refresh_token: string){
		const refreshTokenPayload = refresh_token.split('.')[1];
		const userUpdate = user;
		userUpdate.refreshToken = await bcrypt.hash(refreshTokenPayload, config.get<number>('hash.password.saltOrRounds'));
		await this.updateUser(userUpdate);
	}

	async setUserPw(user: User, pw: PasswordDto) {
		const userUpdate = user;
		const userPw = await bcrypt.hash(pw.password, config.get<number>('hash.password.saltOrRounds'));
		userUpdate.password = userPw;
		await this.updateUser(userUpdate);
	}
	async deleteRefreshToken(uid: number) {
		const user = await this.getUserById(uid);
		if (this.isUserExist(user)){
			user.refreshToken = null;
			await this.userRepository.save(user);
			return true;
		}
		return false;
	}

	async updateUser(user: User) {
		const userUpdate = user;
		await this.userRepository.save(userUpdate);
	}

	async changeProfileImgUrl(user: User, img_url: string): Promise<void> {
		user.profileUrl = img_url;
		await this.userRepository.save(user);
	}

	async logout(user: User){
		const isLogout : boolean = await this.deleteRefreshToken(user.uid);
		if (!isLogout)
			throw new BadRequestException ('RefreshToken Not Deleted');
	}
ß
	async follow(curUser: User, userToFollow: User): Promise<void> {
		const existingFollowing = await this.userFollowRepository.findOne({ where : { fromUserId: curUser.uid, targetToFollowId: userToFollow.uid } });
		if (existingFollowing) {
			throw new Error('You are already following this user.');
		}

		const follow = new UserFollow();
		follow.fromUser = curUser;
		follow.targetToFollow = userToFollow;
		await this.userFollowRepository.save(follow);
	}

	async unfollow(curUser: User, userToUnfollow: User): Promise<void> {
		const existingFollowing = await this.userFollowRepository.findOne({ where : { fromUserId: curUser.uid, targetToFollowId: userToUnfollow.uid } });
		if (!existingFollowing) {
			throw new Error('You are not following this user.');
		}

		await this.userFollowRepository.remove(existingFollowing);
	}

	async toggleTwoFactor(uid: number) {
		const user = await this.getUserById(uid);
		if (this.isUserExist(user)) {
			if (user.twoFactorEnabled) {
				user.twoFactorEnabled = !user.twoFactorEnabled;
				await this.updateUser(user);
				return null;
			} else {
				const { secret, qr } = await this.authService.genTwoFactorSecret(user);
				user.twoFactorSecret = secret;
				await this.updateUser(user);
				return qr;
			}
		}
		throw new UnauthorizedException('User Not Found!');
	}

	async validateUser(email: string, password: string) {
		const user = await this.getUserByEmail(email);

		if (this.isUserExist(user)) {
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				Logger.log(`User(${email}) login success.`);
				const { password, ...userWithoutPw } = user;
				return userWithoutPw;
			}
			throw new UnauthorizedException('Wrong password!');
		}
		throw new UnauthorizedException('User not found!');
	}

	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}
}
