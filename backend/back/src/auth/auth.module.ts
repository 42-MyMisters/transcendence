import { Logger, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import config from 'config';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
			secret: config.get<string>('jwt.secret'),
			signOptions: {
				expiresIn: config.get<string>('jwt.expiresIn'),
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt'}),
	],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
