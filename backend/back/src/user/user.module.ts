import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa/jwt-2fa-auth.guard';
import { Jwt2faStrategy } from 'src/auth/jwt-2fa/jwt-2fa.strategy';
import { JwtRefreshGuard } from 'src/auth/jwt-refresh/jwt-refresh-auth.guard';
import { JwtRefreshStrategy } from 'src/auth/jwt-refresh/jwt-refresh.strategy';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { LocalStrategy } from 'src/auth/local/local.strategy';
import { DatabaseModule } from 'src/database/database.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, Jwt2faAuthGuard, Jwt2faStrategy, JwtAuthGuard, JwtStrategy, LocalAuthGuard, LocalStrategy, JwtRefreshGuard, JwtRefreshStrategy],
  exports: [UserService, AuthModule, DatabaseModule],
})
export class UserModule {}
