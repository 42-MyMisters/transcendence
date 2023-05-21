import { IsNumber } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@Column({default: 0})
	gameType: number;
	
	@CreateDateColumn()
	createdAt: Date;
	
	@ManyToOne(type => User, winner => winner.wonGames, { eager: true })
	winner: User;
	
	@ManyToOne(type => User, loser => loser.lostGames, { eager: true })
	loser: User;
}