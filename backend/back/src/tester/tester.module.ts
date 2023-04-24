import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { LoginModule } from 'src/login/login.module';
import { UserModule } from 'src/user/user.module';
import { TesterController } from './tester.controller';
import { TesterService } from './tester.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
	DatabaseModule, LoginModule, UserModule, AuthModule
  ],
	controllers: [TesterController],
	providers: [TesterService],
	exports: [TesterService]
})
export class TesterModule {}