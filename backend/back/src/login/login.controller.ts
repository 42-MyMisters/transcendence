import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import config from "config";
import { Response } from "express";
import { AuthService } from "src/auth/auth.service";
import { Jwt2faAuthGuard } from "src/auth/jwt-2fa/jwt-2fa-auth.guard";
import { JwtRefreshGuard } from "src/auth/jwt-refresh/jwt-refresh-auth.guard";
import { JwtAuthGuard } from "src/auth/jwt/jwt-auth.guard";
import { LocalAuthGuard } from "src/auth/local/local-auth.guard";
import {
  callFunctionDescriptionOfRefreshRoute,
  ResponseErrorDto
} from "src/swagger/response.util";
import { UserService } from "src/user/user.service";

@Controller("login")
@swagger.ApiTags("로그인")
export class LoginController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @swagger.ApiOperation({
    summary: "42 OAuth를 이용한 로그인 시도",
    description:
      "Client를 42 OAuth로 리디렉트하여 인증 시도. 로그인에 성공하면 'code' query를 가지고 /login/oauth/callback으로 리디렉트.",
  })
  @swagger.ApiResponse({
    status: 302,
    description:
      "42 OAuth로 리디렉션 후, 로그인 시 /login/oauth/callback으로 리디렉션",
  })
  @Get("/oauth")
  @Redirect(
    "https://api.intra.42.fr/oauth/authorize?client_id=" +
      config.get<string>("intra.client_id") +
      "&redirect_uri=" +
      config.get<string>("intra.redirect_uri") +
      "&response_type=code",
    302,
  )
  intra() {}

  // frontend need to redirect user to 2fa auth page.

  @swagger.ApiQuery({
    name: "code",
    type: "string",
    description: "42 OAuth 로그인 콜백에서 받은 code",
    required: true,
    allowEmptyValue: false,
  })
  @swagger.ApiOperation({
    summary: "42 OAuth 로그인 콜백",
    description:
      "42 OAuth 로그인 콜백. 로그인에 성공하면 accessToken을 쿠키에 담고, refreshToken과 2fa 식별자(리디렉트 용)를 리턴.",
  })
  @swagger.ApiOkResponse({
    description: "ok",
    schema: {
      type: "object",
      properties: {
        refreshToken: {
          type: "string",
          description: "리프레쉬용 토큰 - refreshToken",
        },
        redirect: {
          type: "boolean",
          description: "2fa 인증이 필요한 경우 true, 아닌 경우 false",
        },
      },
      example: {
        refreshToken:
          "1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA",
        redirect: false,
      },
    },
  })
  @swagger.ApiUnauthorizedResponse({
    description: "bad 'code'",
    type: ResponseErrorDto,
  })
  @swagger.ApiInternalServerErrorResponse({
    description: "Intra server error try later or Using Id, Password",
    type: ResponseErrorDto,
  })
  @Get("/oauth/callback")
  async intraSignIn(@Res() res: Response, @Query("code") code: string) {
    const userData = await this.authService.intraSignIn(code);
    const user = await this.userService.getUserByIntraDto(userData);

    const tokenSet = await this.authService.login(user);
    await this.userService.setUserRefreshToken(user, tokenSet.refresh_token);

    res.cookie("accessToken", tokenSet.access_token, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true //only https option
    });
    res.cookie("refreshToken", tokenSet.refresh_token);
    return res.redirect("http://localhost:3000/");
  }

  @swagger.ApiQuery({
    description: "로그아웃 ",
    required: true,
  })
  @swagger.ApiOperation({
    summary: "로그아웃 요청 처리",
    description: "AccessToken 제거, Refresh 토큰 제거(만료)",
  })
  @Post("/signout")
  @UseGuards(Jwt2faAuthGuard)
  async logout(@Req() request, @Res() response: Response) {
    response.cookie("accessToken", "", {
      httpOnly: true,
      sameSite: "strict",
      // secure: true //only https option
      expires: new Date(0)
    });
    await this.userService.logout(request.user);
    response.send();
  }

  @swagger.ApiBearerAuth("refreshToken")
  @swagger.ApiHeader({
    name: "authorization",
    description: callFunctionDescriptionOfRefreshRoute(
      "Because too long to write in here",
    ),
    schema: {
      default:
        "비어있으면 테스트가 안되고, vaild한 token을 넣어도 테스트가 안되기에, 그냥 넣어놓은 테스트 문장",
    },
  })
  @swagger.ApiOperation({
    summary: "Refresh Token을 이용한 Access Token 재발급",
    description:
      "Refresh Token을 이용한 Access Token 재발급. Refresh Token이 유효하지 않거나 만료되면 400, 유효하지만 해당 유저가 없으면 401을 리턴.",
  })
  @swagger.ApiCreatedResponse({
    description: "ok",
    schema: {
      type: "string",
      properties: {
        accessToken: { type: "string", description: "재발급된 accessToken" },
      },
      example: {
        accessToken:
          "1NiIsInR5c6IkpXVCJ9.eyJ1axjoxNjgxNDcyOTA3fQ.24Dlhpwbv75GXMireozDpzVA",
      },
    },
  })
  @swagger.ApiBadRequestResponse({
    description: "Refresh Token이 유효하지 않거나 만료되었을 때",
    type: ResponseErrorDto,
  })
  @swagger.ApiUnauthorizedResponse({
    description: "Refresh Token이 유효하지만 해당 유저가 없을 때",
    type: ResponseErrorDto,
  })

  // this is for debug
  @Get("/oauth/refresh")
  @UseGuards(Jwt2faAuthGuard)
  async refAT_DEBUG(
    @Query("ref") ref: string,
    @Req() request,
    @Res() res,
  ){
    this.refreshAccessTokens(" "+ref, request, res);
  }

  @Post("/oauth/refresh")
  @UseGuards(JwtRefreshGuard)
  async refreshAccessTokens(
    @Headers("authorization") refresh_token: string,
    @Req() request,
    @Res() res,
  ) {
    const user = request.user;
    const regeneratedAccessToken = await this.authService.refreshAccessToken(
      refresh_token,
      user,
    );

    res.cookie("accessToken", regeneratedAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true //only https option
    }).sendStatus(201);
  }

  // /2fa/auth will return new accessToken.
  @Post("/2fa/auth")
  @UseGuards(JwtAuthGuard)
  async auth(@Req() request, @Body() body) {
    Logger.log("trying 2fa login");
    const isCodeValid = await this.authService.isTwoFactorCodeValid(
      body.twoFactorCode,
      request.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException("Wrong authentication code");
    }
    const tokens = await this.authService.loginWith2fa(request.user);
    request.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true //only https option
    });
    await this.userService.setUserRefreshToken(
      request.user,
      tokens.refreshToken,
    );
  }

  // login with email & password.
  @Post("/email")
  @UseGuards(LocalAuthGuard)
  loginWithEmail(@Req() request) {
    if (request.user.twoFactorEnabled) {
      throw new UnauthorizedException("2fa required.");
    }
    return this.authService.genAccessToken(request.user, false);
  }
  //For Debug Controller
  @Post("/test")
  @UseGuards(Jwt2faAuthGuard)
  testFunc(): string {
    return "success";
  }

  @UseGuards(Jwt2faAuthGuard)
  @Get("/user")
  showUsers(@Req() request) {
    console.log(request);
    return this.userService.showUsers();
  }

  // For Test
  @Get("/logout")
  @UseGuards(Jwt2faAuthGuard)
  async red(@Req() request, @Res() response: Response) {
    await this.logout(request,response);
    response.send();
  }
}
