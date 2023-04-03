import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column()
	password: string;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	nickname: string;

	@Column()
	refreshToken: string;

	@Column()
	profileUrl: string;

	@Column()
	twoFactorEnabled: boolean;

	@Column()
	twoFactorSecret: string;

	static fromIntraUserDto(intraUserDto: IntraUserDto): User {
		const user = new User();
		user.uid = intraUserDto.id;
		user.email = intraUserDto.email;
		user.nickname = intraUserDto.login;
		user.profileUrl = intraUserDto.image.link;
		user.twoFactorEnabled = false;
		return user;
	}
}