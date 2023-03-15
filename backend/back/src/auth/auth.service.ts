import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService
	){}
	
	async intraSignIn(code: string){
		const userToken = await this.userService.getTokenFromIntra(code);
		const userData  = await this.userService.getUserInfoFromIntra(userToken);
		const currUser = await this.userService.getUserById(userData.id);

		if (isUserExist(currUser)){
			Logger.log(`Already Exsisted User ${currUser.nickname}`);
			const accessToken = currUser.token;
			return { accessToken };
		}
		const accessToken = await this.userService.addNewUser(userData);
		Logger.log(`accessToken = ${accessToken}`)
		return { accessToken };
	}
}

const isUserExist = (user: User | null): user is User => {
	return user !== null;
}
