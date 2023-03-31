import { User } from "src/user/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GameMatchData } from "./game.data.entity";

@Entity()
export class GameMatch extends BaseEntity {
	@ManyToOne(type => GameMatchData, gameMatchData => gameMatchData, { eager: true })
	gameMatchData: GameMatchData;
	
	@ManyToOne(type => User, user => user, { eager: true })
	user: User;
}