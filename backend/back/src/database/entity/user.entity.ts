import { Game } from "src/database/entity/game.entity";
import { UserBlock } from "src/database/entity/user-block.entity";
import { IntraUserDto } from "src/user/dto/IntraUser.dto";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { UserFollow } from "./user-follow.entity";

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column({ nullable: true, type: 'varchar', length: 60 })
	password: string | null;

	@Column({ unique: true, nullable: true, type: 'varchar' })
	email: string | null;

	@Column({ unique: true, type:'varchar' })
	nickname: string;

	@Column({ nullable: true, type: 'varchar', length: 60 })
	refreshToken: string | null;
	
	@Column( {type: 'varchar'} )
	profileUrl: string;
	
	@Column( {type: 'boolean', default: false} )
	twoFactorEnabled: boolean;
	
	@Column({ nullable: true, type: 'varchar' })
	twoFactorSecret: string | null;
	
	@Column({type: 'integer', default: 0})
	elo: number;

	@OneToMany(() => UserFollow, (follower) => follower.fromUser)
	followers: UserFollow[];

	@OneToMany(() => UserFollow, (following) => following.targetToFollow)
	followings: UserFollow[];

	@OneToMany(type => UserBlock, userBlock => userBlock.targetToBlockId)
	blockedUsers: UserBlock[];

	@OneToMany(type => Game, games => games.winner)
	wonGames: Game[];
	
	@OneToMany(type => Game, games => games.loser)
	lostGames: Game[];

	@CreateDateColumn()
	createdAt: Date;

	static fromIntraUserDto(intraUserDto: IntraUserDto): User {
		const user = new User();
		user.uid = intraUserDto.id;
		user.email = intraUserDto.email;
		user.nickname = intraUserDto.login + "#" + intraUserDto.id;
		user.profileUrl = intraUserDto.image.link;
		user.elo = 0;
		user.twoFactorEnabled = false;
		return user;
	}
}
