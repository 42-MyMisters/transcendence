import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GameMatch } from "./game.match.entity";

@Entity()
export class GameMatchData extends BaseEntity {
	@PrimaryGeneratedColumn()
	gid: number;
	
	@Column()
	winner: number;
	
	@Column()
	loser: number;
	
	@Column()
	winnerScore: number;
	
	@Column()
	loserScore: number;
	
	@Column()
	time: number;

	@OneToMany(type => GameMatch, gameMatch => gameMatch, { lazy: true })
	gameMatch: GameMatch[];

}