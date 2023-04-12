import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Game } from './game.entity';
import { GameService } from './game.service';

@Module({

  imports: [  
    TypeOrmModule.forFeature([Game]),
    AuthModule
  ],
  providers: [GameService, JwtService],
  exports: [GameService],
}  )
export class GameModule {}
