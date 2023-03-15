import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import config from 'config';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';

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
  providers: [AuthService, UserRepository, UserService]
})
export class AuthModule {}
