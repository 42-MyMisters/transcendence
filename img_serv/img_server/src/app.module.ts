import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileImageController } from './profile_img/profile_img.controller';

@Module({
  imports: [],
  controllers: [AppController, ProfileImageController],
  providers: [AppService],
})
export class AppModule {}
