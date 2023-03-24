import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";

@Entity()
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


	static fromIntraUserDto(intraUserDto: IntraUserDto): User {
		const user = new User();
		user.uid = intraUserDto.id;
		user.nickname = intraUserDto.login;
		// user.token
		user.profileUrl = intraUserDto.image.link;
		user.twowayFactor = false;
		return user;
	  }
}