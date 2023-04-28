import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './configs/typeorm.config';
import { GameModule } from './game/game.module';
import { LoginModule } from './login/login.module';
import { EventsModule } from './socket/chat.module';
import { TesterModule } from './tester/tester.module';
import { MemoryModule } from './cache/memory.module';

@Module({
	imports: [
		TypeOrmModule.forRoot(typeORMConfig),
		LoginModule,
		MemoryModule,
		GameModule,
		TesterModule,
		EventsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
