import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { typeORMConfig } from './configs/typeorm.config';
import { GameModule } from './game/game.module';
import { LoginModule } from './login/login.module';
import { TesterModule } from './tester/tester.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
		TypeOrmModule.forRoot(typeORMConfig),
		LoginModule,
		GameModule,
		TesterModule,
  ],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}