import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserModule } from 'src/user/user.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [UserModule],
  providers: [GameService, GameGateway, DatabaseService],
  exports: [],
})
export class GameModule {}
