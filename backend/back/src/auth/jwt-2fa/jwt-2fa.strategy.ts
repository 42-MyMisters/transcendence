import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import config from "config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { TokenPayload } from "../token-payload.entity";

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, "jwt-2fa") {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          Logger.log(JSON.stringify(request.cookies));
          if (request?.cookies?.accessToken) {
            return request.cookies.accessToken;
          }
          return null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUserByUid(payload.uid);
    if (this.userService.isUserExist(user)) {
      if (user.nickname.includes("#"))
        throw new UnprocessableEntityException("User nickname invalid");
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
