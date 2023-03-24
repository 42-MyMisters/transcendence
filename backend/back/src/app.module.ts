import { Module } from '@nestjs/common';
import { AuthModule } from './login/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
	TypeOrmModule.forRoot(typeORMConfig),
	AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}