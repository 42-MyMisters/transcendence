import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserFollow } from './user-follow.entity';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { Jwt2faStrategy } from 'src/auth/jwt-2fa/jwt-2fa.strategy';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { LocalStrategy } from 'src/auth/local/local.strategy';
import { JwtRefreshGuard } from 'src/auth/jwt-refresh/jwt-refresh-auth.guard';
import { JwtRefreshStrategy } from 'src/auth/jwt-refresh/jwt-refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([UserFollow]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService, Jwt2faAuthGuard, Jwt2faStrategy, LocalAuthGuard, LocalStrategy, JwtRefreshGuard, JwtRefreshStrategy],
  exports: [UserService],
})
export class UserModule {}
