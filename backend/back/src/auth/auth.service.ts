import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		private userRepository: UserRepository,
		private jwtService: JwtService
	){}
	
	async intraSignIn(code: string) : Promise<{accessToken: string}>{
		const payload : string = code;
		// TODO
		// use code to find intra information

		// if there is no code error

		// resource : code -> intra info
		// make user entity with resource and save to db
		
		// make access token
		const accessToken : string = await this.jwtService.sign(payload);
		return { accessToken };
	}
}
