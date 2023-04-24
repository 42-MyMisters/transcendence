import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseService } from "./database.service";
import { Game } from "./entity/game.entity";
import { UserBlock } from "./entity/user-block.entity";
import { UserFollow } from "./entity/user-follow.entity";
import { User } from "./entity/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserFollow]),
    TypeOrmModule.forFeature([UserBlock]),
    TypeOrmModule.forFeature([Game]),
],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],  
})
export class DatabaseModule {};