import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../Auth.service';
import { User } from '../../user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private AuthService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Partial<User>> {
    const userWithoutPsw = await this.AuthService.validateUser(uid, password);
    if (!userWithoutPsw) {
      throw new UnauthorizedException();
    }
    return userWithoutPsw;
  }
}