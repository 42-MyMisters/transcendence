import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	
	constructor(private authService: AuthService) {}

	@Get('/redir')
	@Redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d66732cf3b341b21ff4c3596d13133df0c2365a3c855440ea26cb9b60f52c668&redirect_uri=http://localhost:4000/auth/login/&response_type=code', 301)
	intra() {
	}

	@Get('/login')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}
}

