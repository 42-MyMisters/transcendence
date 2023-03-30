import { Body, Controller, Get, HttpCode, Logger, Post, Query, Redirect, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import config from 'config';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { PasswordDto } from 'src/user/dto/PasswordDto';
import { UserService } from 'src/user/user.service';

@Controller('login')
export class LoginController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {
	}

	@Get('/oauth')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<string>('intra.client_id') + '&redirect_uri=' + config.get<string>('intra.redirect_uri') + '&response_type=code', 302)
	intra(){
		// if 
	}

	@Post('/login-email')
	@UseGuards(LocalAuthGuard)
	loginWithEmail(@Req() request) {
		if (request.user.twoFactorEnabled) {
			return 'auth code required'
		}
		// 토큰 확인 로직 필요...
		return request.user.token;
	}

	@Post('/setpw')
	@UseGuards(Jwt2faAuthGuard)
	async setPw(
		@Req() request,
		@Body(ValidationPipe) pw:PasswordDto,
		) {
			Logger.log(request);
			await this.authService.setPw(request.user, pw);
			return request.user.access_token;
		}

	// for debug
	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}

	@Get('/oauth/callback')
	async intraSignIn(@Query('code') code: string) {
		return await this.authService.intraSignIn(code);
	}

	@Get('/2fa/toggle')
	@UseGuards(JwtAuthGuard)
	async toggleTwoFactor(@Req() request) {
		return await this.authService.toggleTwoFactor(request.user.uid);
	}

	@Post('/2fa/authenticate')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async authenticate(@Req() request, @Body() body) {
		Logger.log('trying 2fa login');
	  const isCodeValid = await this.authService.isTwoFactorCodeValid(
			body.twoFactorCode,
			request.user,
			);
			
			Logger.log(`isCodeValid: ${isCodeValid}`);
	  if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
	  }
  
	  return this.authService.loginWith2fa(request.user);
	}

}

