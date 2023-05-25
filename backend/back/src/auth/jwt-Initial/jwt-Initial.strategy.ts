import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import config from "config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { TokenPayload } from "../token-payload.entity";

@Injectable()
export class JwtInitialStrategy extends PassportStrategy(
  Strategy,
  "jwt-initial",
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          // Logger.log(JSON.stringify(request.cookies));
          if (request?.cookies?.accessToken) {
            return request.cookies.accessToken;
          }
          return null;
        },
      ]),
      secretOrKey: config.get<string>("jwt.secret"),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUserByUid(payload.uid);
    if (this.userService.isUserExist(user)) {
      if (!user.twoFactorEnabled) {
        return user;
      }
      if (payload.twoFactorAuthenticated) {
        return user;
      }
    }
    throw new UnauthorizedException("User not found");
  }
}
