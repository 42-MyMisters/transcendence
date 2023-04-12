import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';
import { User } from '../../user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Partial<User>> {
    const userWithoutPw = await this.userService.validateUser(email, password);
    if (!userWithoutPw) {
      throw new UnauthorizedException('user or password is not correct.');
    }
    return userWithoutPw;
  }
}