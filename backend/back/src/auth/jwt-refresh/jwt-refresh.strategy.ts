import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException
} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import config from "config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { TokenPayload } from "../token-payload.entity";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUserByUid(payload.uid);
    if (this.userService.isUserExist(user)) {
      if (user.nickname.includes("#"))
        throw new UnprocessableEntityException("User nickname invalid");
      return user;
    }
    throw new UnauthorizedException("User not found");
  }
}
