import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { toDataURL } from 'qrcode';
import config from 'config';
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
				throw (`HTTP error! status: ${response.status}`);
			}
			const intraUserInfo: IntraUserDto = await response.json();
			return intraUserInfo;
		}
		catch (error) {
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
			throw (`HTTP error! status: ${response.status}`);
		}
		return intraToken;	
	}
	
	async intraSignIn(code: string) {
		const userToken = await this.getTokenFromIntra(code);
		const userData = await this.getUserInfoFromIntra(userToken);
		let currUser = await this.userService.getUserById(userData.id);

		if (!this.userService.isUserExist(currUser)){
			currUser = await this.userService.addNewUser(userData);
		}
		return currUser;
	}

	// Save 2fa secret, but twoFactorEnabled value does not change.
	async genTwoFactorSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(user.nickname, 'My Misters', secret);

		user.twoFactorSecret = secret;
		await this.userService.updateUser(user);
		return await this.genQrCodeURL(otpAuthUrl);
	}

	async toggleTwoFactor(uid: number) {
		const user = await this.userService.getUserById(uid);
		if (this.userService.isUserExist(user)) {
			if (user.twoFactorEnabled) {
				user.twoFactorEnabled = !user.twoFactorEnabled;
				await this.userService.updateUser(user);
				return null;
			} else {
				return await this.genTwoFactorSecret(user);
			}
		}
		throw new UnauthorizedException('User Not Found!');
	}

	async genQrCodeURL(otpAuthUrl: string): Promise<{ data: string }> {
		return toDataURL(otpAuthUrl);
	}

	async isTwoFactorCodeValid(twoFactorCode: string, user: User) {
		return authenticator.verify({ token: twoFactorCode, secret: user.twoFactorSecret });
	}

	async loginWith2fa(userWithoutPw: Omit<User, 'password'>) {
		return await this.genAccessToken(userWithoutPw, true);
	}

	async login(userWithoutPw: Omit<User, 'password'>) {
		return await this.genAccessToken(userWithoutPw, false);
	}

  async validateUser(email: string, password: string) {
		const user = await this.userService.getUserByEmail(email);

		if (this.userService.isUserExist(user)) {
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				Logger.log(`User(${email}) login success.`);
				const { password, ...userWithoutPw } = user;
				return userWithoutPw;
			}
			throw new UnauthorizedException('Wrong password!');
		}
		throw new UnauthorizedException('User not found!');
  }

	async genAccessToken(user: Omit<User, 'password'>, twoFactor: boolean) {
		const payload = {
			uid: user.uid,
			twoFactorEnabled: user.twoFactorEnabled,
			twoFactorAuthenticated: twoFactor,
		}
		return { accessToken: this.jwtService.sign(payload) };
	}

}

