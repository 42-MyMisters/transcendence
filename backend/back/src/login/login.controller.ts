import { Controller, Get, Query, Redirect } from '@nestjs/common';
import config from 'config';
import { AuthService } from 'src/auth/auth.service';

@Controller('login')
export class LoginController {
	constructor(private authService: AuthService) {
	}

	@Get('/oauth')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + config.get<any>('intra').client_id + '&redirect_uri=' + config.get<any>('intra').redirect_uri + '&response_type=code', 301)
	intra(){
	}

	@Get('/oauth/callback')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}

}

