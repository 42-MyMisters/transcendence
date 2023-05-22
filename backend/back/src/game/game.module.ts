import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserModule } from 'src/user/user.module';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [UserModule],
  controllers: [GameController],
  providers: [GameService, GameGateway],
  exports: [],
})
export class GameModule {}
