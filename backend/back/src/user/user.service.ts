import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IntraUserDto } from "./dto/IntraUserDto";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { PasswordDto } from "./dto/PasswordDto";
import config from "config";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService,
	){}

	async addNewUser(intraUserDto: IntraUserDto): Promise<User> {
		const user: User = await User.fromIntraUserDto(intraUserDto);
		user.password = 'null';
		user.refreshToken ='null';
		user.twoFactorSecret = 'null';
		await this.userRepository.save(user);
		return user;
	}

	async getUserById(uid: number) {
		const user = await this.userRepository.findOneBy({uid});
		return user;
	}
	
	async getUserByEmail(email: string) {
		const user = await this.userRepository.findOneBy({email});
		return user;
	}
	
	async showUsers() {
		const users = await this.userRepository.find();
		return users;
	}

	async setUserRefreshToken(user: User, refresh_token: string){
		const userUpdate = user;
		userUpdate.refreshToken = refresh_token;
		await this.updateUser(userUpdate);
	}

	async setUserPw(user: User, pw: PasswordDto) {
		const userUpdate = user;
		const userPw = await bcrypt.hash(pw.password, config.get<number>('hash.password.saltOrRounds'));
		userUpdate.password = userPw;
		await this.updateUser(userUpdate);
	}

	async updateUser(user: User) {
		const userUpdate = user;
		await this.userRepository.save(userUpdate);
	}

	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}

}