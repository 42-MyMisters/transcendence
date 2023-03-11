import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	
	constructor(private authService: AuthService) {}

	@Get('/login')
	intraSignIn(@Query('code') code: string) : Promise<{accessToken: string}>{
		console.log(code);
		return this.authService.intraSignIn(code);
	}

}
