import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { LoginController } from './login.controller';

@Module({
	imports: [UserModule, AuthModule],
	controllers: [LoginController],
  })
  export class LoginModule {}
  