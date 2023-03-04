import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { UserSchema } from './user.schema';
import { UserSubscriber } from './user.subscriber';

@Module({
//   imports: [TypeOrmModule.forFeature([User])],
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
