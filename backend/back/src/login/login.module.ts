import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { LoginController } from './login.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		DatabaseModule, UserModule, AuthModule, JwtModule
	],
	controllers: [LoginController],
	providers: [AuthService, UserService],
	exports: []
  })
  export class LoginModule {}
  