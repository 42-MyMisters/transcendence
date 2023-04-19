import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { LoginModule } from 'src/login/login.module';
import { UserModule } from 'src/user/user.module';
import { TesterController } from './tester.controller';
import { TesterService } from './tester.service';

@Module({
  imports: [
	LoginModule, UserModule, AuthModule
  ],
	controllers: [TesterController],
	providers: [TesterService],
	exports: [TesterService]
})
export class TesterModule {}