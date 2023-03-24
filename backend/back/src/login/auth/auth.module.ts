import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const jwtConfig : any = config.get('jwt');

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.register({
			secret: jwtConfig.secret,
			signOptions: {
				expiresIn: jwtConfig.expiresIn,
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt'}),
	],
  controllers: [AuthController],
  providers: [AuthService, UserService]
})
export class AuthModule {}
