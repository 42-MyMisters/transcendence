import { Body, Controller, Get, Post, Query, Redirect, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import config from 'config';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {
	}

	@Get('/redir')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<any>('intra').client_id + '&redirect_uri=' + config.get<any>('intra').redirect_uri + '&response_type=code', 301)
	intra(){
	}

	@Get('/login')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}

	@Post('/2fa/toggle')
	@UseGuards(JwtAuthGuard)
	async toggleTwoFactorAuthentication(@Req() request, @Body() body) {
		
		const isCodeValid =
			this.authService.isTwoFactorAuthenticationCodeValid(
				body.twoFactorAuthenticationCode,
				request.user,
			);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.toggleTwoFactorAuthentication(request.user.uid);
	}

}

