import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({

  imports: [DatabaseModule, AuthModule],
  providers: [GameService, GameGateway],
  exports: [GameService],
}  )
export class GameModule {}
