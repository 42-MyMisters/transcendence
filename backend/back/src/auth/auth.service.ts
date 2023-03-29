import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';
import config from 'config';
import { PasswordDto } from 'src/user/dto/PasswordDto';
import { IntraTokenDto } from 'src/user/dto/IntraTokenDto';
import { IntraUserDto } from 'src/user/dto/IntraUserDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
	){}

	async getUserInfoFromIntra(tokenObject: IntraTokenDto): Promise<IntraUserDto>{
		const meUrl = 'https://api.intra.42.fr/v2/me';
		try {
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
		catch (error) {
			Logger.log(error);
			throw new Error('Failed to fetch user information from Intra');
		}
	}


	async getTokenFromIntra(code: string) : Promise<IntraTokenDto> {
		const clientId = config.get<string>('intra.client_id');
		const clientSecret = config.get<string>('intra.client_secret');
		const redirect_uri = config.get<string>('intra.redirect_uri');
		const url = config.get<string>('intra.url');

		const params = new URLSearchParams();
		params.set('grant_type', 'authorization_code');
		params.set('client_id', clientId); 
		params.set('client_secret',clientSecret);
		params.set('code', code);
		params.set('redirect_uri',redirect_uri);

		const response = await fetch(url, {
			method: 'POST',
			body: params
		});

		const intraToken : IntraTokenDto = await response.json();
		if (response.status < 200 || response.status >= 300) {
			Logger.log(`${response}`);
			Logger.log(`${response.status}`);
			throw (`HTTP error! status: ${response.status}`);
		}
		return intraToken;	
	}
	
	
	async intraSignIn(code: string){
		const userToken = await this.getTokenFromIntra(code);
		const userData = await this.getUserInfoFromIntra(userToken);
		const currUser = await this.userService.getUserById(userData.id);

		if (this.userService.isUserExist(currUser)){
			Logger.log(`Already Exsisted User ${currUser.nickname}`);
			if (currUser.twoFactorEnabled) {

			} else {

			}
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
	
		return { secret, otpauthUrl };
	}

	async toggleTwoFactor(uid: number) {
		const user = await this.userService.getUserById(uid);
		if (this.userService.isUserExist(user)) {
			user.twoFactorEnabled = !user.twoFactorEnabled;
			if (user.twoFactorEnabled) {
				this.genTwoFactorSecret(user);
			} else {
				user.twoFactorSecret = '';
			}
			this.userService.updateUser(user);
			return user.twoFactorEnabled;
		}
		throw new UnauthorizedException('User Not Found!');
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorCodeValid(twoFactorCode: string, user: User) {
		return authenticator.verify({ token: twoFactorCode, secret: user.twoFactorSecret });
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

  async validateUser(email: string, password: string) {
		const user = await this.userService.getUserByEmail(email);

		if (this.userService.isUserExist(user)) {
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				Logger.log(`User(${email}) login success.`);
				return user;
			}
			throw new UnauthorizedException('Wrong password!');
		}
		throw new UnauthorizedException('User not found!');
  }

	async setPw(user: User, pw: PasswordDto) {
		const userPw = await bcrypt.hash(pw.password, config.get<number>('hash.password.saltOrRounds'));
		const userUpdate = user;
		userUpdate.password = userPw;
		await this.userService.updateUser(userUpdate);
	}
}

