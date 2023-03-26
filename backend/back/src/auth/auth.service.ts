import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';
import { bcrypt } from 'bcrypt';
import config from 'config';

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
		} else {
      const accessToken = await this.userService.addNewUser(userData);
      Logger.log(`accessToken = ${accessToken}`)
      return { accessToken };
    }
	}

	// 2FA
	async genTwoFactorSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.nickname, 'My Misters', secret);

		user.twoFactorSecret = secret;
		await this.userService.updateUser(user);
	
		return {
			secret,
			otpauthUrl
		}
	}

	async toggleTwoFactor(uid: number) {
		const user = await this.userService.getUserById(uid);
		if (this.userService.isUserExist(user)) {
			user.twoFactorEnabled = !user.twoFactorEnabled;
			if (user.twoFactorEnabled) {
				this.genTwoFactorSecret(user);
			}
			this.userService.updateUser(user);
			return user.twoFactorEnabled;
		}
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorAuthenticationCodeValid(twoFactorCode: string, user: User) {
		return authenticator.verify({
		  token: twoFactorCode,
		  secret: user.twoFactorSecret,
		});
	  }

	async loginWith2fa(userWithoutPsw: Partial<User>) {
		const payload = {
			uid: userWithoutPsw.uid,
			twoFactorEnabled: !!userWithoutPsw.twoFactorEnabled
		};

		return {
			uid: payload.uid,
			access_token: this.jwtService.sign(payload),
		};
	}

  async validateUser(uid: number, password: string) {
    const hash = await bcrypt.hash(password, config.get<number>('hash.password.saltOrRounds'));
    const isMatch = await bcrypt.compare(password, hash);
    if (isMatch) {
      Logger.log(`User(${uid}) login success.`);
      return this.userService.getUserById(uid);
    }
    return null;
  }

}

