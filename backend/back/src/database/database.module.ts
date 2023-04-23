import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { UserFollow } from "./entity/user-follow.entity";
import { Game } from "./entity/game.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
	TypeOrmModule.forFeature([UserFollow]),
    TypeOrmModule.forFeature([Game]),
],
  controllers: [],
  providers: [DatabaseService],
  exports: [DatabaseService],  
})
export class DatabaseModule {};