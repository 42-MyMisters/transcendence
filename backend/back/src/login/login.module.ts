import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { LoginController } from './login.controller';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { Jwt2faStrategy } from 'src/auth/jwt-2fa/jwt-2fa.strategy';
import { LocalStrategy } from 'src/auth/local/local.strategy';
import { UserFollow } from 'src/user/user-follow.entity';

const jwtConfig : any = config.get('jwt');

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([UserFollow]),
		JwtModule.register({
			secret: jwtConfig.secret,
			signOptions: {
				expiresIn: jwtConfig.expiresIn,
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt'}),
	],
	controllers: [LoginController],
	providers: [AuthService, UserService, JwtStrategy, Jwt2faStrategy, LocalStrategy]
})
export class LoginModule {}
