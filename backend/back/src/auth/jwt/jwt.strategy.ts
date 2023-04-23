import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { TokenPayload } from '../token-payload.entity';
import config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getUserByUid(payload.uid);
    if (this.userService.isUserExist(user)) {
      return user;
    }
    throw new UnauthorizedException('User not found');
  }
}