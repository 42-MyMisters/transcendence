import { IsNumber } from "class-validator";
import { GameType } from "src/game/game.enum";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsNumber()
	gid: number;

	@Column()
	winnerId: number;
	
	@Column()
	loserId: number;

	@Column()
	winnerScore: number;
	
	@Column()
	loserScore: number;

	@Column()
	gameType: number;
	
	@CreateDateColumn()
	createdAt: Date;
	
	@ManyToOne(type => User, winner => winner.wonGames, { eager: true })
	winner: User;
	
	@ManyToOne(type => User, loser => loser.lostGames, { eager: true })
	loser: User;
}