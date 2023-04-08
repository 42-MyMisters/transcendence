import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faStrategy } from 'src/auth/jwt-2fa/jwt-2fa.strategy';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { LocalStrategy } from 'src/auth/local/local.strategy';
import { UserFollow } from 'src/user/user-follow.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { LoginController } from './login.controller';
import { JwtRefreshStrategy } from 'src/auth/jwt-refresh/jwt-refresh.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([UserFollow]),
		JwtModule.register({
			secret: config.get<string>('jwt.secret'),
			signOptions: {
				expiresIn: config.get<string>('jwt.expiresIn'),
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt'}),
	],
	controllers: [LoginController],
	providers: [AuthService, UserService, JwtStrategy, Jwt2faStrategy, LocalStrategy, JwtRefreshStrategy]
})
export class LoginModule{
}
