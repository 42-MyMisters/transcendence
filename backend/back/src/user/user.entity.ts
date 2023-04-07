<<<<<<< HEAD
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUser.dto";
=======
import { Game } from "src/game/game.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";
import { UserFollow } from "./user-follow.entity";
>>>>>>> ffb4a750b74b3de53c8c2f53819b4531a35b80a2

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column({nullable: true})
	password: string;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	nickname: string;

	@Column({nullable: true})
	refreshToken: string;

	@Column()
	profileUrl: string;

	@Column()
	twoFactorEnabled: boolean;

	@Column({nullable: true})
	twoFactorSecret: string;

	@OneToMany(type => UserFollow, follower => follower.fromUser, { lazy: true })
	followers: UserFollow[];
  
	@OneToMany(type => UserFollow, following => following.targetToFollow, { lazy: true })
	followings: UserFollow[];
	
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
<<<<<<< HEAD
=======

>>>>>>> ffb4a750b74b3de53c8c2f53819b4531a35b80a2
}
