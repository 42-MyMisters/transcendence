import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Jwt2faAuthGuard } from "src/auth/jwt-2fa/jwt-2fa-auth.guard";
import { DatabaseService } from "src/database/database.service";

@Controller('/game')
@ApiTags('Game')
export class GameController{
    constructor(private readonly databaseService: DatabaseService){}

    @Get("/leaderboard")
    @UseGuards(Jwt2faAuthGuard)
    async loadLeaderboard(){
        // = await this.databaseService.findUserByELODESC();

    }

}