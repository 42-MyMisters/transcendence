import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IntraUserDto } from "./dto/IntraUserDto";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService,
	){}


	async addNewUser(intraUserDto: IntraUserDto): Promise<string>{
		const payload = {uuid : intraUserDto.id};
		const accessToken : string = await this.jwtService.sign(payload);
		const user: User = await User.fromIntraUserDto(intraUserDto);
		user.token = accessToken;
		await this.userRepository.save(user);
		return accessToken;
	}

	async getUserById(uid: number) {
		const user = await this.userRepository.findOneBy({uid});
		return user;
	}

	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}


}