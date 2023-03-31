import { GameMatch } from "src/game/game.match.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";
import { UserFollower } from "./user.follower.entity";
import { UserFollowing } from "./user.following.entity";

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

	@OneToMany(type => UserFollower, follower => follower, { lazy:true })
	follower: User[];

	@OneToMany(type => UserFollowing, following => following, { lazy:true })
	following: User[];

	@OneToMany(type => GameMatch, gameMatch => gameMatch, { lazy:true })
	gameMatch: GameMatch[];

	static fromIntraUserDto(intraUserDto: IntraUserDto): User {
		const user = new User();
		user.uid = intraUserDto.id;
		user.email = intraUserDto.email;
		user.nickname = intraUserDto.login;
		user.profileUrl = intraUserDto.image.link;
		user.twoFactorEnabled = false;
		return user;
	}
}