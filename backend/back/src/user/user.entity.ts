import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { IntraUserDto } from "./dto/IntraUserDto";

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn()
	uid: number;

	@Column({nullable: true})
	password: string | null;

	@Column({ unique: true })
	email: string;

	@Column({ unique: true })
	nickname: string;

	@Column({nullable: true})
	refreshToken: string | null;

	@Column()
	profileUrl: string;

	@Column()
	twoFactorEnabled: boolean;

	@Column({nullable: true})
	twoFactorSecret: string | null;

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