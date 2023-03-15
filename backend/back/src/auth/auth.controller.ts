import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	
	constructor(private authService: AuthService) {}

	@Get('/login')
	// @Redirect()
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		return this.authService.intraSignIn(code);
	}
}

