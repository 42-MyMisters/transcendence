import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { EventsModule } from './chat/chat.module';
import { typeORMConfig } from './configs/typeorm.config';
import { GameModule } from './game/game.module';
import { LoginModule } from './login/login.module';
import { TesterModule } from './tester/tester.module';

@Module({
	imports: [
		TypeOrmModule.forRoot(typeORMConfig),
		LoginModule,
		GameModule,
		TesterModule,
		EventsModule,
	],
	controllers: [AppController],
})
export class AppModule { }
