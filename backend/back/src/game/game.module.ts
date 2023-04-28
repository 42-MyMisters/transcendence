import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [UserModule],
  providers: [GameService, GameGateway],
  exports: [],
})
export class GameModule {}
