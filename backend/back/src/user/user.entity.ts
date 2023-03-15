import { BaseEntity, Column, PrimaryColumn } from "typeorm";

export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column()
	nickname: string;

	@Column()
	token: string;

	@Column()
	profileUrl: string;

	@Column()
	twowayFactor: boolean;
}