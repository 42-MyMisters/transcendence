import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { LoginController } from './login.controller';

@Module({
	imports: [
		DatabaseModule, UserModule, AuthModule, JwtModule
	],
	controllers: [LoginController],
	providers: [AuthService, UserService],
	exports: []
  })
  export class LoginModule {}
  