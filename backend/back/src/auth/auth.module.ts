import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Jwt2faStrategy } from './jwt-2fa/jwt-2fa.strategy';
import { JwtStrategy } from './jwt/jwt.strategy';
import { LocalStrategy } from './local/local.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.register({
			secret: config.get<string>('jwt.secret'),
			signOptions: {
				expiresIn: 10,
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt'}),
	],
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStrategy, JwtStrategy, Jwt2faStrategy]
})
export class AuthModule {}
