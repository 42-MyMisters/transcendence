import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { LoginController } from './login.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	imports: [
	  UserModule, AuthModule,
	],
	controllers: [LoginController],
	providers: []
  })
  export class LoginModule {}
  