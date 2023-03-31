import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserFollowing extends BaseEntity {
	@PrimaryColumn()
	id: number;

	@ManyToOne(type => User, user => user, { eager:true })
	user: User;
}