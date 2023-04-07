import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import config from "config";
import { Repository } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";
import { PasswordDto } from "./dto/PasswordDto";
import { UserFollow } from "./user-follow.entity";
import { User } from "./user.entity";

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

	async setUserRefreshToken(user: User, refresh_token: string){
		const userUpdate = user;
		userUpdate.refreshToken = refresh_token;
		await this.updateUser(userUpdate);
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
}
=======
>>>>>>> MYM-51-BE-swagger-advanced
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

}
<<<<<<< HEAD
=======
}
>>>>>>> e9cf7af0 (MYM-51 [add] swagger dir && rename dto files)
=======
>>>>>>> ffb4a750b74b3de53c8c2f53819b4531a35b80a2
>>>>>>> MYM-51-BE-swagger-advanced
