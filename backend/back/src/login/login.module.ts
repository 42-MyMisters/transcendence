import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from 'config';
import { LoginController } from './login.controller';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { AuthService } from 'src/auth/auth.service';

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
	controllers: [LoginController],
	providers: [AuthService, UserService]
})
export class LoginModule {}
