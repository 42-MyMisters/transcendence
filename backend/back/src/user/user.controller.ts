import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import * as swagger from "@nestjs/swagger";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import path from "path";
import sharp from "sharp";
import { AuthService } from "src/auth/auth.service";
import { Jwt2faAuthGuard } from "src/auth/jwt-2fa/jwt-2fa-auth.guard";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { UserService } from "src/user/user.service";
import { changeNicknameDto } from "./dto/ChangeNickname.dto";
import { FollowingUserDto } from "./dto/FollowingUser.dto";
import { PasswordDto } from "./dto/Password.dto";
import { TwoFactorConfirmDto } from "./dto/TwoFactorConfirm.dto";
import { UserProfileDto } from "./dto/UserProfile.dto";
import { JwtInitialAuthGuard } from "src/auth/jwt-Initial/jwt-Initial.auth.guard";
import config from "config";

@swagger.ApiTags("유저")
@Controller("user")
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }
  @ApiOperation({
    summary: "2fa 등록 / (이미 등록된 상태라면) 끄기",
    description: "2fa 인증 활성화/비활성화 ",
  })
  @ApiOkResponse({
    description: "QR code URL (2fa 인증 URL 발급) 혹은 null",
    schema: {
      oneOf: [{ type: "string" }, { type: "null" }],
    },
  })
  @ApiForbiddenResponse({
    description: "User Not Found",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  // When toggleTwoFactor returns qrcode, user should verify OTP code through /2fa/auth/confirm.
  // Otherwise, user's twoFactorEnabled value does not change.
  @Get("/2fa/toggle")
  @UseGuards(JwtAuthGuard)
  async toggleTwoFactor(@Req() request) {
    return await this.userService.toggleTwoFactor(request.user.uid);
  }

  @ApiOperation({
    summary: "2fa code 인증 로그인",
    description: "2fa code 인증",
  })
  @ApiOkResponse({
    description: "쿠키에 refeshToken 값 리턴, accessToken 비공개로 리턴",
  })
  @swagger.ApiUnauthorizedResponse({
    description: "Wrong authentication code",
  })
  @Post("/2fa/toggle/confirm")
  @UseGuards(JwtAuthGuard)
  async authConfirm(
    @Req() request,
    @Res() res: Response,
    @Body() twoFactorConfirmDto: TwoFactorConfirmDto,
  ) {
    Logger.log("2fa toggle confirm");
    const isCodeValid = await this.userService.isTwoFactorCodeValid(
      twoFactorConfirmDto.twoFactorCode,
      request.user,
    );
    if (!isCodeValid) {
      Logger.log("2fa confirmation failed. try again.");
      throw new UnauthorizedException("Wrong authentication code");
    }
    await this.userService.setUserTwoFactorEnabled(request.user, true);
    const tokenSet = await this.authService.loginWith2fa(request.user);

    res.cookie("accessToken", tokenSet.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true //only https option
    });
    res.cookie("refreshToken", tokenSet.refreshToken);
    return res.redirect(config.get<string>('public-url.frontend'));
  }

  @ApiOperation({
    summary: "팔로잉",
    description: "uid 에 해당하는 유저를 팔로잉",
  })
  @swagger.ApiParam({
    type: "number",
    name: "uid",
  })
  @swagger.ApiConflictResponse({ description: "자기 자신을 Follow 할 경우" })
  @swagger.ApiUnauthorizedResponse({ description: "권한 없음" })
  @Post("/follow/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async follow(@Req() request, @Param("uid") uid: number) {
    const curUser = request.user;
    if (curUser.uid === uid) {
      throw new ConflictException("Can't follow");
    }
    const user = await this.userService.getUserByUid(uid);
    if (this.userService.isUserExist(user)) {
      await this.userService.follow(request.user, user);
    } else {
      throw new UnauthorizedException("User Not Found!");
    }
  }

  @ApiOperation({
    summary: "언팔로잉",
    description: "uid 에 해당하는 유저를 언팔로잉",
  })
  @swagger.ApiParam({
    type: "number",
    name: "uid",
  })
  @swagger.ApiUnauthorizedResponse({ description: "권한 X" })
  @swagger.ApiNotFoundResponse({
    description: "uid에 해당하는 아이디는 있으나, 팔로우되어있지 않은경우",
  })
  @Post("/unfollow/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async unfollow(@Req() request, @Param("uid") uid: number) {
    const user = await this.userService.getUserByUid(uid);
    if (this.userService.isUserExist(user)) {
      await this.userService.unfollow(request.user, user);
    } else {
      throw new UnauthorizedException("User Not Found!");
    }
  }

  @ApiOperation({
    summary: "프로필 이미지 변경",
    description: "현재 로그인된 유저의 프로필 이미지 변경",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "이미지 파일 (jpg, jpeg, png)",
  })
  @ApiUnauthorizedResponse({ description: "로그인이 필요합니다." })
  @ApiInternalServerErrorResponse({ description: "이미지 에러" })
  @Post("/profile-img-change")
  @UseGuards(JwtInitialAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async changeProfileImg(
    @Req() request,
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    const user = request.user;
    const filename = `${user.uid}_profile.jpg`;
    try {
      await sharp(file[0].buffer)
        .resize(500, 500)
        .flatten({ background: "#fff" })
        .toFormat("jpeg", { mozjpeg: true })
        .toFile(`img/${filename}`);
      const profileUrl = `https://${config.get<string>('dns')}/images/${filename}`;
      await this.userService.setUserProfileUrl(user, profileUrl);
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException("img error!");
    }
  }

  @ApiOperation({ summary: "유저 닉네임 변경" })
  @ApiUnauthorizedResponse({ description: " 권한 없음 " })
  @ApiBadRequestResponse({ description: "Invalid request parameters" })
  @Patch("/nickname")
  @UseGuards(JwtInitialAuthGuard)
  async updateNickname(
    @Req() request,
    @Body() changeNicknameDto: changeNicknameDto,
  ) {
    const user = request.user;
    await this.userService.setUserNickname(user, changeNicknameDto.nickname);
  }

  @swagger.ApiQuery({})
  @swagger.ApiOperation({
    summary: "내 User 정보를 리턴",
    description: "필요한 User 정보 리턴",
  })
  @swagger.ApiOkResponse({
    description: "ok",
    schema: {
      type: "object",
      properties: {
        uid: {
          type: "number",
          description: "user 의 intra uid 이자 고유 관리 번호",
        },
        nickname: { type: "string", description: "user 의 고유한 닉네임" },
        profileUrl: { type: "string", description: "user 의 프로필 사진 URL" },
        ELO: { type: "number", description: "user의 티어 " },
        followings: {
          type: "object",
          description: "유저가 팔로우 중인 User정보",
        },
        games: { type: "object", description: "게임 정보를 담은 Game Object" },
      },
      // example: { refreshToken: '1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA', redirect: false, },
    },
  })
  @Post("/me")
  @UseGuards(JwtInitialAuthGuard)
  async getUserProfie(@Req() reqeust): Promise<UserProfileDto> {
    const user = reqeust.user;
    return await this.userService.getUserProfile(user.uid);
  }

  @Get("/me")
  @UseGuards(JwtInitialAuthGuard)
  async GETgetUserProfie(@Req() reqeust): Promise<UserProfileDto> {
    return await this.getUserProfie(reqeust);
  }

  @Get("/profile/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async findUserProfile(@Param("uid") uid: number) {
    return await this.userService.getUserProfile(uid);
  }

  // for debug
  @Get("/profile-img-change")
  @UseGuards(Jwt2faAuthGuard)
  uploadPage(@Res() res: Response) {
    const filePath = path.join(__dirname, "../../src/login/upload.html");
    res.sendFile(filePath);
  }
  @Get("/nickname")
  @UseGuards(Jwt2faAuthGuard)
  async testupdateNickname(@Req() request) {
    await this.updateNickname(request, { nickname: "asdf" });
  }

  @swagger.ApiOperation({
    summary: "현재 로그인한 유저의 Following 유저 정보 조회",
    description: "현재 로그인한 유저의 Following 한 유저의 정보를 조회",
  })
  @swagger.ApiOkResponse({
    description: "현재 로그인한 유저의 Following한 유저 정보 조회 성공",
    type: [FollowingUserDto],
  })
  @Get("/following")
  @UseGuards(Jwt2faAuthGuard)
  async getUserFollowing(@Req() request): Promise<FollowingUserDto[] | null> {
    return await this.userService.getFollowingUserInfo(request.user.uid);
  }

  @Get("/game/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async findGameStatus(@Req() request, @Param("uid") uid: number) {
    return await this.userService.getUserGameStatusById(request.user.uid);
  }

  // @Get('/get-profile/:filename')
  // getProfilePicture_debug(@Res() res: Response, @Param('filename') filename) {
  // 	const filePath = path.join(__dirname, `../../uploads/${filename}`);
  // 	res.sendFile(filePath);
  // }

  // set user pw
  @Post("/setpw")
  @UseGuards(Jwt2faAuthGuard)
  async setPw(@Req() request, @Body(ValidationPipe) pw: PasswordDto) {
    await this.userService.setUserPw(request.user, pw);
  }

  // for debug
  @Get("/user")
  showUsers() {
    return this.userService.showUsers();
  }
  @Get("/follow/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async followGET(@Req() request, @Param("uid") uid: number) {
    await this.follow(request, uid);
  }

  @Get("/unfollow/:uid")
  @UseGuards(Jwt2faAuthGuard)
  async unfollowGET(@Req() request, @Param("uid") uid: number) {
    await this.unfollow(request, uid);
  }
}
