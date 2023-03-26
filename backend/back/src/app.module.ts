import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';

@Module({
  imports: [
	TypeOrmModule.forRoot(typeORMConfig),
	LoginModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}