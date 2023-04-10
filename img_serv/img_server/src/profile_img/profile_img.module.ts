import { Module } from '@nestjs/common';
import { ProfileImageController } from './profile_img.controller';

@Module({
  imports: [],
  controllers: [ProfileImageController],
  providers: [],
})
export class ProfileImageModule {}
