import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { IntraTokenDto } from 'src/user/dto/IntraTokenDto';
import { IntraUserDto } from 'src/user/dto/IntraUserDto';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	){}
	
	async intraSignIn(code: string) : Promise<{accessToken: string}>{
		const userToken: IntraTokenDto = await this.userService.getTokenFromIntra(code);
		const userData: IntraUserDto  = await this.userService.getUserInfoFromIntra(userToken);
		// Logger.log(userData);getTokenFromIntra
		// console.log(userData);
		const payload = {uuid : userData.id.toString};
		const accessToken : string = await this.jwtService.sign(payload);
		Logger.log(`accessToken = ${accessToken}`)
		return { accessToken };
	}
}
