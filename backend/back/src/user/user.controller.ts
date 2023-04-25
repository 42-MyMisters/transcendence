import { Body, Controller, Get, InternalServerErrorException, Logger, Param, Patch, Post, Query, Req, Res, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as swagger from '@nestjs/swagger';
import { Response } from 'express';
import path from 'path';
import sharp from 'sharp';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserFollow } from 'src/database/entity/user-follow.entity';
import { UserService } from 'src/user/user.service';
import { changeNicknameDto } from './dto/ChangeNickname.dto';
import { FollowingUserDto } from './dto/FollowingUser.dto';
import { PasswordDto } from './dto/Password.dto';
import { UserProfileDto } from './dto/UserProfile.dto';

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
		await this.userService.setUserTwoFactorEnabled(request.user, true);
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

	@Get('/follow')
	@UseGuards(Jwt2faAuthGuard)
	async followGET(@Req() request, @Query('uid')uid: number) {
		await this.follow(request,{uid});
	}

	@Post('/follow')
	@UseGuards(Jwt2faAuthGuard)
	async follow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByUid(body.uid);
		if (this.userService.isUserExist(user)) {
			await this.userService.follow(request.user, user);
		} else {
			throw new UnauthorizedException("User Not Found!");
		}
	}

	@Post('/unfollow')
	@UseGuards(Jwt2faAuthGuard)
	async unfollow(@Req() request, @Body() body) {
		const user = await this.userService.getUserByUid(body.uid);
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
		const filename = `${user.uid}_profile.jpg`;
		try {
			await sharp(file[0].buffer)
			.resize(500, 500)
			.flatten({ background: '#fff' })
			.toFormat("jpeg", { mozjpeg: true })
			.toFile(`uploads/${filename}`);
			const profileUrl = `http://localhost:4000/login/get-profile/${filename}`
			await this.userService.setUserProfileUrl(user, profileUrl);	
		} catch (e) {
			Logger.error(e);
			throw new InternalServerErrorException('img error!');
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

	@swagger.ApiQuery({})
	@swagger.ApiOperation({
		summary: '내 User 정보를 리턴',
		description: '필요한 User 정보 리턴',
	})
	@swagger.ApiOkResponse({
		description: 'ok',
		schema: {
			type: 'object',
			properties: {
				uid:  { type: 'number', description: 'user 의 intra uid 이자 고유 관리 번호', },
				nickname:{ type: 'string', description: 'user 의 고유한 닉네임', },
				profileUrl: { type: 'string', description: 'user 의 프로필 사진 URL', },
				ELO: { type: 'number', description: 'user의 티어 ', },
				followings: { type: 'object', description: '유저가 팔로우 중인 User정보', },
				games: { type: 'object', description: '게임 정보를 담은 Game Object', },
			},
			// example: { refreshToken: '1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA', redirect: false, },
		},
	})

	@Post('/me')
	@UseGuards(Jwt2faAuthGuard)
	async getUserProfie (@Req() reqeust) : Promise<UserProfileDto>{
		const user = reqeust.user;
		return await this.userService.getUserProfile(user.uid);
	}


	@Get('/me')
	@UseGuards(Jwt2faAuthGuard)
	async GETgetUserProfie (@Req() reqeust) : Promise<UserProfileDto>{
		return await this.getUserProfie(reqeust);
	}


	// for debug
	@Get('/get-profile/:filename')
	getProfilePicture_debug(@Res() res: Response, @Param('filename') filename) {
		const filePath = path.join(__dirname, `../../uploads/${filename}`);
		res.sendFile(filePath);
	}

	@swagger.ApiOperation({
		summary: '현재 로그인한 유저의 Following 유저 정보 조회',
		description: '현재 로그인한 유저의 Following 한 유저의 정보를 조회',
	})
	@swagger.ApiOkResponse({
		description: '현재 로그인한 유저의 Following한 유저 정보 조회 성공',
		type: [FollowingUserDto[]],
	})	
	@Get('/following')
	@UseGuards(Jwt2faAuthGuard)
	async getUserFollowing(@Req() request): Promise<FollowingUserDto[] | null>{
		return await this.userService.getFollowingUserInfo(request.user.uid);
	}
}
