import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { TokenPayload } from '../token-payload.entity';
import config from 'config';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUserById(payload.uid);
    if (this.userService.isUserExist(user)) {
      if (!user.twoFactorEnabled) {
        return user;
      }
      if (payload.twoFactorAuthenticated) {
        return user;
      }
    }
    throw new UnauthorizedException('User not found');
  }
}