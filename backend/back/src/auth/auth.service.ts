import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';

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

		if (this.userService.isUserExist(currUser)){
			Logger.log(`Already Exsisted User ${currUser.nickname}`);
			const accessToken = currUser.token;
			return { accessToken };
		}
		const accessToken = await this.userService.addNewUser(userData);
		Logger.log(`accessToken = ${accessToken}`)
		return { accessToken };
	}

	// 2FA
	async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
	
		const otpauthUrl = authenticator.keyuri(user.nickname, 'AUTH_APP_NAME', secret);
	
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.uid);
	
		return {
		  secret,
		  otpauthUrl
		}
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorAuthenticationCodeValid(twoFACode: string, user: User) {
		return authenticator.verify({
		  token: twoFACode,
		  secret: user.twoFASecret,
		});
	  }

	async loginWith2fa(userWithoutPsw: Partial<User>) {
		const payload = {
			email: userWithoutPsw.email,
			isTwoFactorAuthenticationEnabled: !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
			isTwoFactorAuthenticated: true,
		};

		return {
			email: payload.email,
			access_token: this.jwtService.sign(payload),
		};
	}

}

