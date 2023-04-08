import { User } from "../user/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn()
	gid: number;
	
	@ManyToOne(type => User, winner => winner.wonGames, { eager: true })
	winner: User;
	
	@ManyToOne(type => User, loser => loser.lostGames, { eager: true })
	loser: User;
	
	@Column()
	winnerScore: number;
	
	@Column()
	loserScore: number;
	
	@CreateDateColumn()
	createdAt: Date;

}