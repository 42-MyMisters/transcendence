import { Module } from '@nestjs/common';
import { GameService } from './game.service';

@Module({
  imports: [],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
