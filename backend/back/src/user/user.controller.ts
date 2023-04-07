import { Body, Controller, Get, Logger, Post, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { PasswordDto } from './dto/Password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
export class UserController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		) {
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

	// set user pw
	@Post('/setpw')
	@UseGuards(Jwt2faAuthGuard)
	async setPw(
		@Req() request,
		@Body(ValidationPipe) pw:PasswordDto,
	) {
		await this.userService.setUserPw(request.user, pw);
	}

	// for debug
	@Get('/user')
	showUsers() {
		return this.userService.showUsers();
	}

	@Post('/follow')
	@UseGuards(JwtAuthGuard)
	async follow(@Req() request, @Body() body){
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.follow(request.user, user);
		} else {
			throw new UnauthorizedException("User Not Found!");
		}
	}

	@Post('/unfollow')
	@UseGuards(JwtAuthGuard)
	async unfollow(@Req() request, @Body() body){
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.unfollow(request.user, user);
		} else {
			throw new UnauthorizedException("User Not Found!");
		}
	}

}
