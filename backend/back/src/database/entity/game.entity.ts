import { IsNumber } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class Game extends BaseEntity {
	@PrimaryGeneratedColumn()
	@IsNumber()
	gid: number;

	@Column()
	winnerScore: number;
	
	@Column()
	loserScore: number;

	@Column({default: 0})
	gameType: number;
	
	@CreateDateColumn()
	createdAt: Date;

	@Column({ type: 'integer' })
	winnerUid: number;
  
	@Column({ type: 'integer' })
	loserUid: number;
	
	@ManyToOne(() => User, (winner) => winner.wonGames)
	@JoinColumn({
		name: 'winnerUid',
		referencedColumnName: 'uid',
	  })
	winner: User;
	
	@ManyToOne(() => User, (loser) => loser.lostGames)
	@JoinColumn({
		name: 'loserUid',
		referencedColumnName: 'uid',
	  })
	loser: User;
}