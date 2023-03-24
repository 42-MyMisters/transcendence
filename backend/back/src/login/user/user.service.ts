import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import config from 'config';
import { IntraTokenDto } from "./dto/IntraTokenDto";
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


	async getUserInfoFromIntra(tokenObject: IntraTokenDto): Promise<IntraUserDto>{
		const meUrl = 'https://api.intra.42.fr/v2/me';
		const response = await fetch(meUrl, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${tokenObject.access_token}`,
			},
		});
		if (response.status < 200 || response.status >= 300) {
			Logger.log(`${response}`);
			Logger.log(`${response.status}`);
			throw (`HTTP error! status: ${response.status}`);
		}
		const intraUserInfo: IntraUserDto = await response.json();
		return intraUserInfo;
	}

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