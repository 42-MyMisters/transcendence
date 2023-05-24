import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { request } from "express";
import { Jwt2faAuthGuard } from "src/auth/jwt-2fa/jwt-2fa-auth.guard";
import { DatabaseService } from "src/database/database.service";

@Controller('/game')
@ApiTags('Game')
export class GameController{
    constructor(private readonly databaseService: DatabaseService){}

    @Get("/leaderboard")
    @UseGuards(Jwt2faAuthGuard)
    async loadLeaderboard(){
        const result = await this.databaseService.findLeaderboard();
        return result;
    }

    @Get("/status")
    @UseGuards(Jwt2faAuthGuard)
    async loadMyGameStatus(@Req() request){
        const result = await this.databaseService.findGameStatusByUid(request.user.uid);
        return result;
    }
    // @Param("uid") uid: number
    @Get("/status/:uid")
    @UseGuards(Jwt2faAuthGuard)
    async loadGameStatus(@Param("uid") uid: number){
        const result = await this.databaseService.findGameStatusByUid(uid);
        return result;
    }
}