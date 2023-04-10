import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileImageModule } from './profile_img/profile_img.module';

@Module({
  imports: [
    ProfileImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
