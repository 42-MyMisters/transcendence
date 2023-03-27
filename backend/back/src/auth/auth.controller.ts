import { Body, Controller, Get, HttpCode, Logger, Post, Query, Redirect, Req, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import config from 'config';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { PasswordDto } from 'src/user/dto/PasswordDto';
import { bcrypt } from 'bcrypt';


@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {
	}

	@Get('/intraSignIn')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<string>('intra.client_id') + '&redirect_uri=' + config.get<string>('intra.redirect_uri') + '&response_type=code', 301)
	intra(){
	}

	@Post('/login-email')
	loginWithEmail(@Body() body) {
		const email = body.email;
		const password = body.password;
	}

	@Post('/setpw')
	setPw(
		@Req() request,
		@Body(ValidationPipe) pw:PasswordDto,
		) {
			Logger.log(request);
			return this.authService.setPw(request.user, pw);
	}

	// for debug
	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}

	@Get('/login')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}

	@Post('/2fa/toggle')
	@UseGuards(JwtAuthGuard)
	async toggleTwoFactor(@Req() request, @Body() body) {
		
		const isCodeValid =
			this.authService.isTwoFactorAuthenticationCodeValid(
				body.twoFactorAuthenticationCode,
				request.user,
			);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.authService.toggleTwoFactor(request.user.uid);
	}

	@Post('/2fa/authenticate')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async authenticate(@Req() request, @Body() body) {
	  const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
		body.twoFactorAuthenticationCode,
		request.user,
	  );
  
	  if (!isCodeValid) {
		throw new UnauthorizedException('Wrong authentication code');
	  }
  
	  return this.authService.loginWith2fa(request.user);
	}

}

