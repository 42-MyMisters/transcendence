import {
	Body,
	Controller,
	Get,
	Logger,
	Post,
	Query,
	Redirect,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import config from 'config';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { PasswordDto } from 'src/user/dto/Password.dto';
import { UserService } from 'src/user/user.service';
import * as swagger from '@nestjs/swagger';

@Controller('login')
@swagger.ApiTags('Login')
export class LoginController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
	) {
		//empty
	}

	@Get('/oauth')
	@swagger.ApiOperation({
		summary: '42 OAuth를 이용한 로그인 시도',
		description:
			"Client를 42 OAuth로 리디렉트하여 인증 시도. 로그인에 성공하면 'code' query를 가지고 /login/oauth/callback으로 리디렉트.",
	})
	@swagger.ApiResponse({
		status: 302,
		description:
			'42 OAuth로 리디렉션 후, 로그인 시 /login/oauth/callback으로 리디렉션',
	})
	@Redirect(
		'https://api.intra.42.fr/oauth/authorize?client_id=' +
		config.get<string>('intra.client_id') +
		'&redirect_uri=' +
		config.get<string>('intra.redirect_uri') +
		'&response_type=code',
		302,
	)
	intra() {
		//empty
	}

	// frontend need to redirect user to 2fa auth page.
	@Get('/oauth/callback')
	@swagger.ApiOperation({
		summary: '42 OAuth 로그인 콜백',
		description:
			'42 OAuth 로그인 콜백. 로그인에 성공하면 access_token을 쿠키에 담고, refreshToken과 2fa 식별자(리디렉트 용)를 리턴.',
		parameters: [
			{
				name: 'code',
				in: 'query',
				required: true,
				allowEmptyValue: false,
			},
		],
	})
	@swagger.ApiOkResponse({
		description: 'ok',
		schema: {
			type: 'object',
			properties: {
				refreshToken: {
					type: 'string',
					description: '리프레쉬용 토큰 - refreshToken',
				},
				redirect: {
					type: 'boolean',
					description: '2fa 인증이 필요한 경우 true, 아닌 경우 false',
				},
			},
			example: {
				refreshToken:
					'1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA',
				redirect: false,
			},
		},
	})
	@swagger.ApiUnauthorizedResponse({ description: "bad 'code'" })
	@swagger.ApiInternalServerErrorResponse({
		description: 'Intra server error try later or Using Id, Password',
	})
	async intraSignIn(@Res() res: Response, @Query('code') code: string) {
		const user = await this.authService.intraSignIn(code);
		const { access_token, refresh_token } = await this.authService.login(
			user,
		);

		await this.userService.setUserRefreshToken(
			user,
			refresh_token.refreshToken,
		);
		res.cookie('accessToken', access_token, { // NOTE : 이전 쿠키에 계속 쌓임
			httpOnly: true,
			sameSite: 'strict',
			// secure: true //only https option
		});
		if (user.twoFactorEnabled) {
			return { ...refresh_token, redirect: true };
		}
		return res.json({ ...refresh_token, redirect: false });
	}

	@Post('/oauth/refresh')
	@swagger.ApiOperation({
		summary: 'Refresh Token을 이용한 Access Token 재발급',
		description:
			'Refresh Token을 이용한 Access Token 재발급. Refresh Token이 유효하지 않거나 만료되면 400, 유효하지만 해당 유저가 없으면 401을 리턴.',
	})
	@swagger.ApiBody({
		schema: {
			properties: {
				refreshToken: {
					type: 'string',
					description: '리프레쉬용 토큰 - refreshToken',
				},
			},
			example: {
				refreshToken:
					'1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA',
			},
		},
	})
	@swagger.ApiCreatedResponse({
		description: 'ok',
		schema: {
			type: 'string',
			properties: {
				accessToken: {
					type: 'string',
					description: '재발급된 accessToken',
				},
			},
			example: {
				accessToken:
					'1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA',
			},
		},
	})
	@swagger.ApiBadRequestResponse({
		description: 'Refresh Token이 유효하지 않거나 만료되었을 때',
	})
	@swagger.ApiUnauthorizedResponse({
		description: 'Refresh Token이 유효하지만 해당 유저가 없을 때',
	})
	async refreshTokens(@Body('refreshToken') refresh_token: string) {
		const refreshToken = refresh_token;
		return await this.authService.refreshAccessTokenRefreshToken(
			refreshToken,
		);
	}

	// login with email & password.
	@Post('/email')
	@UseGuards(LocalAuthGuard)
	loginWithEmail(@Req() request) {
		if (request.user.twoFactorEnabled) {
			throw new UnauthorizedException('2fa required.');
		}
		return this.authService.genAccessToken(request.user, false);
	}

	@Post('/setpw')
	@UseGuards(Jwt2faAuthGuard)
	async setPw(@Req() request, @Body(ValidationPipe) pw: PasswordDto) {
		await this.userService.setUserPw(request.user, pw);
	}

	// When toggleTwoFactor returns qrcode, user should verify OTP code through /2fa/auth/confirm.
	// Otherwise, user's twoFactorEnabled value does not change.
	@Get('/2fa/toggle')
	@UseGuards(JwtAuthGuard)
	async toggleTwoFactor(@Req() request) {
		return await this.authService.toggleTwoFactor(request.user.uid);
	}

	@Post('/2fa/toggle/confirm')
	@UseGuards(JwtAuthGuard)
	async authConfirm(@Req() request, @Body() body) {
		Logger.log('2fa toggle confirm');
		const isCodeValid = await this.authService.isTwoFactorCodeValid(
			body.twoFactorCode,
			request.user,
		);
		if (!isCodeValid) {
			Logger.log('2fa confirmation failed. try again.');
			throw new UnauthorizedException('Wrong authentication code');
		}
		const user = request.user;
		user.twoFactorEnabled = true;
		await this.userService.updateUser(user);
		return await this.authService.loginWith2fa(request.user);
	}

	// /2fa/auth will return new accessToken.
	@Post('/2fa/auth')
	@UseGuards(JwtAuthGuard)
	async auth(@Req() request, @Body() body) {
		Logger.log('trying 2fa login');
		const isCodeValid = await this.authService.isTwoFactorCodeValid(
			body.twoFactorCode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		return await this.authService.loginWith2fa(request.user);
	}

	@Post('/follow')
	@UseGuards(JwtAuthGuard)
	async follow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.follow(request.user, user);
		} else {
			throw new UnauthorizedException('User Not Found!');
		}
	}

	@Post('/unfollow')
	@UseGuards(JwtAuthGuard)
	async unfollow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.unfollow(request.user, user);
		} else {
			throw new UnauthorizedException('User Not Found!');
		}
	}

	//For Debug Controller
	@Post('/test')
	@UseGuards(Jwt2faAuthGuard)
	testFunc(): string {
		return 'success';
	}

	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}
}
