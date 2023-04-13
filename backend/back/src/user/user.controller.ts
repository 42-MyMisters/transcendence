import { Body, Controller, Get, InternalServerErrorException, Logger, Param, Patch, Post, Req, Res, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as swagger from '@nestjs/swagger';
import { Response } from 'express';
import path from 'path';
import sharp from 'sharp';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { PasswordDto } from './dto/Password.dto';
import { changeNicknameDto } from './dto/ChangeNickname.dto';

@Controller('user')
@swagger.ApiTags('user')
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
		return await this.userService.toggleTwoFactor(request.user.uid);
	}
	

	@Post('/2fa/toggle/confirm')
	@UseGuards(JwtAuthGuard)
	async authConfirm(@Req() request, @Body() body) {
		Logger.log('2fa toggle confirm');
		const isCodeValid = await this.userService.isTwoFactorCodeValid(
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
		@Body(ValidationPipe) pw: PasswordDto,
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
	async follow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.follow(request.user, user);
		} else {
			throw new UnauthorizedException("User Not Found!");
		}
	}

	@Post('/unfollow')
	@UseGuards(JwtAuthGuard)
	async unfollow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByEmail(body.targetEmail);
		if (this.userService.isUserExist(user)) {
			await this.userService.unfollow(request.user, user);
		} else {
			throw new UnauthorizedException("User Not Found!");
		}
	}

	@Get('/profile-img-change')
	@UseGuards(Jwt2faAuthGuard)
	uploadPage(@Res() res: Response) {
		const filePath = path.join(__dirname, '../../src/login/upload.html');
    	res.sendFile(filePath);
	}
	
	@Post('/profile-img-change')
	@UseGuards(Jwt2faAuthGuard)
	@UseInterceptors(AnyFilesInterceptor())
	async changeProfileImg(@Req() request, @UploadedFiles() file: Express.Multer.File[]) {
		const user = request.user;
		if (this.userService.isUserExist(user)) {
			const filename = `${user.uid}_profile.jpg`;

			try {
				await sharp(file[0].buffer)
				.resize(500, 500)
				.flatten({ background: '#fff' })
				.toFormat("jpeg", { mozjpeg: true })
				.toFile(`uploads/${filename}`);
				
				user.profileUrl = `http://localhost:4000/login/get-profile/${filename}`
				await this.userService.updateUser(user);
				} catch (e) {
					console.log(e);
					throw new InternalServerErrorException('img error!');
				}
			} else {
				throw new UnauthorizedException('user not found!');
			}
	}
	@Get('/nickname')
	@UseGuards(Jwt2faAuthGuard)
	async testupdateNickname(@Req() request){
		await this.updateNickname(request, {nickname: 'asdf'});
		
	}

	@Patch('/nickname')
	@UseGuards(Jwt2faAuthGuard)
	async updateNickname(@Req() request, @Body() changeNicknameDto: changeNicknameDto){
		const user = request.user;
		await this.userService.setUserNickname(user, changeNicknameDto.nickname);
	}

	// for debug
	@Get('/get-profile/:filename')
	getProfile(@Res() res: Response, @Param('filename') filename) {
		const filePath = path.join(__dirname, `../../uploads/${filename}`);
		res.sendFile(filePath);
	}

}
