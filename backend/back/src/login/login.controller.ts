import { Body, Controller, Get, HttpCode, Logger, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import config from 'config';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { PasswordDto } from 'src/user/dto/PasswordDto';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { Request } from 'express';

@Controller('login')
export class LoginController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {
	}



	// intra sign in. redirect to /oath/callback.
	@Get('/oauth')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<string>('intra.client_id') + '&redirect_uri=' + config.get<string>('intra.redirect_uri') + '&response_type=code', 302)
	intra(){
	}
	
	// intraSignIn will return accessToken with 2fa redirection condition.
	// frontend need to redirect user to 2fa auth page.
	@Get('/oauth/callback')
	async intraSignIn(@Res() res: Response, @Query('code') code: string) {
		const user = await this.authService.intraSignIn(code);
		const { access_token, refresh_token } = await this.authService.login(user);

		await this.userService.setUserRefreshToken(user, refresh_token.refreshToken);
		res.cookie('access_token', 
			access_token, { 
				httpOnly: true, 
				sameSite: 'strict',
				// secure: true //only https option
			 });
		if (user.twoFactorEnabled) {
			return { ...refresh_token, redirect: true };
		}
		return res.json({ ...refresh_token, redirect: false });
	}

	// access_token expired => reissueance With Cookie(RefreshToken)
	// IF refreshToken form is invalid or Expired => 400 BadRequestException(errMsg);
	// IF refreshToken is valid But there is no Matching User => 401 Unauthorized
	@Post('/oauth/refresh')
	async refreshTokens(@Body('refreshToken') refresh_token: string) {
		const refreshToken = refresh_token;
		return await this.authService.refreshAccessTokenRefreshToken(refreshToken);
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
	async setPw(
		@Req() request,
		@Body(ValidationPipe) pw:PasswordDto,
	) {
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



	//For Debug Controller
	@Post('/test')
	@UseGuards(Jwt2faAuthGuard)
	testFunc(): string{
		return "success";
	}

	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}



}
