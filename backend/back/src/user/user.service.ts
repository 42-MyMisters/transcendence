import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import config from 'config';
import { IntraTokenDto } from "./dto/IntraTokenDto";
import { IntraUserDto } from "./dto/IntraUserDto";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bcrypt } from 'bcrypt';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private jwtService: JwtService,
	){}

	async getTokenFromIntra(code: string) : Promise<IntraTokenDto> {
		const clientId = config.get<string>('intra.client_id');
		const clientSecret = config.get<string>('intra.client_secret');
		const redirectUri = config.get<string>('intra.redirect_uri');
		const url = config.get<string>('intra.url');

		Logger.log(`client id: ${clientId}`);
		Logger.log(`client secret: ${clientSecret}`);
		Logger.log(`redirect uri: ${redirectUri}`);

		const params = new URLSearchParams();
		params.set('grant_type', 'authorization_code');
		params.set('client_id', clientId); 
		params.set('client_secret',clientSecret);
		params.set('code', code);
		params.set('redirect_uri',redirectUri);

		const response = await fetch(url, {
			method: 'POST',
			body: params
		});

		const intraToken : IntraTokenDto = await response.json();
		if (response.status < 200 || response.status >= 300) {
			Logger.log(`response: ${response}`);
			Logger.log(`status: ${response.status}`);
			throw (`HTTP error! status: ${response.status}`);
		}
		return intraToken;	
	}
	
	async getUserInfoFromIntra(tokenObject: IntraTokenDto): Promise<IntraUserDto> {
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

	async addNewUser(intraUserDto: IntraUserDto): Promise<string> {
		const payload = {uuid : intraUserDto.id};
		const accessToken : string = await this.jwtService.sign(payload);
		const user: User = await User.fromIntraUserDto(intraUserDto);
		user.password = '';
		user.token = accessToken;
		user.twoFactorSecret = '';
		await this.userRepository.save(user);
		return accessToken;
	}

	async getUserById(uid: number) {
		const user = await this.userRepository.findOneBy({uid});
		return user;
	}

	async updateUser(user: User) {
		await this.userRepository.save(user);
	}

	isUserExist = (user: User | null): user is User => {
		return user !== null;
	}

}