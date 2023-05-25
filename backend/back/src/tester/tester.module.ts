import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { TesterController } from './tester.controller';
import { TesterService } from './tester.service';

@Module({
  imports: [
	DatabaseModule, UserModule, AuthModule
  ],
	controllers: [TesterController],
	providers: [TesterService],
	exports: [TesterService]
})
export class TesterModule {}