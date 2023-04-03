import { Injectable, Logger } from "@nestjs/common";
import { IntraUserDto } from "./dto/IntraUserDto";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { PasswordDto } from "./dto/PasswordDto";
import config from "config";
import { UserFollow } from "./user-follow.entity";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

		@InjectRepository(UserFollow)
		private userFollowRepository: Repository<UserFollow>,

	){}

	async addNewUser(intraUserDto: IntraUserDto): Promise<User> {
		const user: User = await User.fromIntraUserDto(intraUserDto);
		user.password = 'null';
		user.token = 'null';
		user.twoFactorSecret = 'null';
		await this.userRepository.save(user);
		return user;
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

	async setUserPw(user: User, pw: PasswordDto) {
		const userUpdate = user;
		const userPw = await bcrypt.hash(pw.password, config.get<number>('hash.password.saltOrRounds'));
		userUpdate.password = userPw;
		await this.updateUser(userUpdate);
	}

	async updateUser(user: User) {
		const userUpdate = user;
		await this.userRepository.save(userUpdate);
	}

	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}

	async follow(curUser: User, userToFollow: User): Promise<void> {
		await this.userFollowRepository.manager.transaction(async transactionalEntityManager => {
			const existingFollowing = await transactionalEntityManager.findOne(UserFollow, { where : { followerId: curUser.uid, followingId: userToFollow.uid } });
			if (existingFollowing) {
				throw new Error('You are already following this user.');
			}
			const cUser = curUser;
			const fUser = userToFollow;
	
			const follow = new UserFollow();
			follow.follower = curUser;
			follow.following = userToFollow;
			await transactionalEntityManager.save(follow);
	
			cUser.followings.push(follow);
			await transactionalEntityManager.save(cUser);
	
			fUser.followers.push(follow);
			await transactionalEntityManager.save(fUser);
		});
		// const existingFollowing = await this.userFollowingRepository.findOne({ where: { userId: curUser.uid, followingId: userToFollow.uid } });
		// if (existingFollowing) {
		// 	throw new Error('You are already following this user.');
		// }

		// const following = new UserFollowing();
		// following.user = curUser;
		// following.following = userToFollow;
		// await this.userFollowingRepository.save(following);

		// curUser.followings.push(following);
		// await this.userRepository.save(curUser);

		// const follower = new UserFollower();
		// follower.user = userToFollow;
		// follower.follower = curUser;
		// await this.userFollowerRepository.save(follower);

		// userToFollow.followers.push(follower);
		// await this.userRepository.save(userToFollow);
	}

	// async unfollow(userToUnfollow: User): Promise<void> {
	// 	const following = await UserFollowing.findOne({ where: { userId: this.uid, followingId: userToUnfollow.uid } });

	// 	if (!following) {
	// 		throw new Error('You are not following this user.');
	// 	}

	// 	await following.remove();

	// 	this.followings = this.followings.filter(f => f.followingId !== userToUnfollow.uid);
	// 	await this.save();
	// }

}