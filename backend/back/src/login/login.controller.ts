import { Body, Controller, Get, HttpCode, Post, Query, Redirect, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import config from 'config';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { PasswordDto } from 'src/user/dto/PasswordDto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Controller('login')
export class LoginController {
	constructor(private authService: AuthService, private userService: UserService) {
	}

	@Get('/oauth')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<string>('intra.client_id') + '&redirect_uri=' + config.get<string>('intra.redirect_uri') + '&response_type=code', 301)
	intra(){
		// if 
	}

	@Post('/login-email')
	@UseGuards(LocalAuthGuard)
	loginWithEmail(@Req() request) {
		return request.user.access_token;
	}

	@Post('/setpw')
	@UseGuards(JwtAuthGuard)
	async setPw(
		@Req() request,
		@Body(ValidationPipe) pw:PasswordDto,
		) {
			const user : User = request.user;
			await this.authService.setPw(user, pw);
			return request.user.access_token;
		}

	// for debug
	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}

	@Get('/oauth/callback')
	async intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return await this.authService.intraSignIn(code);
	}

	@Post('/2fa/toggle')
	@UseGuards(JwtAuthGuard)
	async toggleTwoFactor(@Req() request, @Body() body) {
		const isCodeValid = this.authService.isTwoFactorCodeValid(
			body.twoFactorCode,
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
	  const isCodeValid = this.authService.isTwoFactorCodeValid(
			body.twoFactorCode,
			request.user,
	  );
  
	  if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
	  }
  
	  return this.authService.loginWith2fa(request.user);
	}

}

