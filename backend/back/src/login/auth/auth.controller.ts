import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import config from 'config';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {
	}

	@Get('/redir')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<any>('intra').client_id + '&redirect_uri=' + config.get<any>('intra').redirect_uri + '&response_type=code', 301)
	intra(){
	}

	@Get('/login')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}

}

