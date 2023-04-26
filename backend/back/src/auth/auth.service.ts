import { BadGatewayException, BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import config from 'config';
import { authenticator } from 'otplib';
import { User } from 'src/database/entity/user.entity';
import { IntraTokenDto } from 'src/user/dto/IntraToken.dto';
import { IntraUserDto } from 'src/user/dto/IntraUser.dto';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
	) { }

	async getUserInfoFromIntra(tokenObject: IntraTokenDto): Promise<IntraUserDto> {
		const meUrl = 'https://api.intra.42.fr/v2/me';
		try {
			const response = await fetch(meUrl, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${tokenObject.access_token}`,
				},
			});
			if (response.status < 200 || response.status >= 300) {
				Logger.error('Intra Error');
				throw new BadRequestException(`HTTP error! status: ${response.status}`);
			}
			const intraUserInfo: IntraUserDto = await response.json();
			return intraUserInfo;
		}
		catch (error) {
			Logger.error('Intra Error');
			throw new BadGatewayException('Failed to fetch user information from Intra');
		}
	}

	async getTokenFromIntra(code: string): Promise<IntraTokenDto> {
		const clientId = config.get<string>('intra.client_id');
		const clientSecret = config.get<string>('intra.client_secret');
		const redirect_uri = config.get<string>('intra.redirect_uri');
		const url = config.get<string>('intra.url');

		const params = new URLSearchParams();
		params.set('grant_type', 'authorization_code');
		params.set('client_id', clientId);
		params.set('client_secret', clientSecret);
		params.set('code', code);
		params.set('redirect_uri', redirect_uri);

		const response = await fetch(url, {
			method: 'POST',
			body: params
		});

		const intraToken : IntraTokenDto = await response.json();
		if (response.status < 200 || response.status >= 300) {
			Logger.error('Intra code error');
			throw new BadRequestException(`HTTP error! status: ${response.status}`);
		}
		return intraToken;
	}

	async intraSignIn(code: string) : Promise<IntraUserDto> {
		const userToken = await this.getTokenFromIntra(code);
		const userData = await this.getUserInfoFromIntra(userToken);
		return userData;
		// const curUser = await this.userService.getUserById(userData.id);

		// if (!this.userService.isUserExist(curUser)) {
		// 	const newUser = await this.userService.addNewUser(userData);
		// 	return newUser;
		// }
		// TODO: refreshToken 이 이미 있는경우 처리
		// return curUser;
	}



	async isTwoFactorCodeValid(twoFactorCode: string, user: User) {
		if (!user.twoFactorSecret) {
			return false;
		}
		return authenticator.verify({ token: twoFactorCode, secret: user.twoFactorSecret });
	}

	async loginWith2fa(userWithoutPw: Omit<User, 'password'>) : Promise<{refreshToken: string, accessToken: string}> {
		const refreshToken = await this.genRefreshToken(userWithoutPw, true);
		const accessToken = await this.genAccessToken(userWithoutPw, true);
		return {refreshToken, accessToken};
	}

	async login(userWithoutPw: Omit<User, 'password'>) {
		const access_token = await this.genAccessToken(userWithoutPw, false);
		const refresh_token = await this.genRefreshToken(userWithoutPw, false);
		return { access_token, refresh_token };
	}



	async genAccessToken(user: Omit<User, 'password'>, twoFactor: boolean) {
		const payload = {
			uid: user.uid,
			twoFactorEnabled: user.twoFactorEnabled,
			twoFactorAuthenticated: twoFactor,
		}
		const access_token = this.jwtService.sign(payload);
		return access_token;
	}

	async genRefreshToken(user: Omit<User, 'password'>, twoFactor: boolean) {
		const payload = {
			refresh: true,
			uid: user.uid,
			twoFactorEnabled: user.twoFactorEnabled,
			twoFactorAuthenticated: twoFactor,
		}
		const refreshToken = await this.jwtService.sign(payload, { expiresIn: config.get<string>('jwt-refresh.exp')});
		return refreshToken;	
	}

	// async verifyJwtToken(refreshToken: string): Promise<TokenPayload> {
	// 	try {
	// 		const payload = await this.jwtService.verify(refreshToken);
	// 		return payload;
	// 	}
	// 	catch (error) {
	// 		const errMsg = `Failed to verify the refresh token:  ${String(error)}`;
	// 		Logger.error(errMsg);
	// 		throw new BadRequestException(errMsg);
	// 	}
	// }

	async refreshAccessToken(refresh_token: string, user: User) {
		const refreshToken = refresh_token.split(' ')[1];
		const refreshTokenPayload = refreshToken.split('.')[1];
		const isMatch = await bcrypt.compare(refreshTokenPayload, user.refreshToken);
		if (isMatch) {
			return await this.genAccessToken(user, user.twoFactorEnabled);
		}
		else {
			const errMsg = 'The refresh token provided is invalid. Please log in again.';
			Logger.error(errMsg);
			throw new UnauthorizedException(errMsg);
		}
	}

	async jwtVerify(token: string): Promise<number> {
		try {
			const payload = await this.jwtService.verify(token);
			return payload.uid;
		} catch(e) {
			console.log(e);
			throw new UnauthorizedException("user not found");
		}
	}

}
