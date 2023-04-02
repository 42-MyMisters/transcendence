import { Game } from "src/game/game.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";
import { UserFollower } from "./user-follower.entity";
import { UserFollowing } from "./user-following.entity";

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column()
	password: string;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	nickname: string;

	@Column()
	token: string;

	@Column()
	profileUrl: string;

	@Column()
	twoFactorEnabled: boolean;

	@Column()
	twoFactorSecret: string;

	@OneToMany(() => UserFollower, follower => follower.user, { lazy: true })
	followers: UserFollower[];
  
	@OneToMany(() => UserFollowing, following => following.user, { lazy: true })
	followings: UserFollowing[];
	
	@OneToMany(type => Game, games => games.winner, { lazy: true })
	wonGames: Game[];

	@OneToMany(type => Game, games => games.loser, { lazy: true })
	lostGames: Game[];

	@CreateDateColumn()
	createdAt: Date;

	static fromIntraUserDto(intraUserDto: IntraUserDto): User {
		const user = new User();
		user.uid = intraUserDto.id;
		user.email = intraUserDto.email;
		user.nickname = intraUserDto.login;
		user.profileUrl = intraUserDto.image.link;
		user.twoFactorEnabled = false;
		return user;
	}

	async follow(userToFollow: User): Promise<void> {
		const existingFollowing = await UserFollowing.findOne({ where: { userId: this.uid, followingId: userToFollow.uid } });

		if (existingFollowing) {
			throw new Error('You are already following this user.');
		}

		const following = new UserFollowing();
		following.user = this;
		following.following = userToFollow;
		await following.save();

		this.followings.push(following);
		await this.save();
	}

	async unfollow(userToUnfollow: User): Promise<void> {
		const following = await UserFollowing.findOne({ where: { userId: this.uid, followingId: userToUnfollow.uid } });

		if (!following) {
			throw new Error('You are not following this user.');
		}

		await following.remove();

		this.followings = this.followings.filter(f => f.followingId !== userToUnfollow.uid);
		await this.save();
	}

}
