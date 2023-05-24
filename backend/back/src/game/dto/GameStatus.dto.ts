import { Game } from "src/database/entity/game.entity";

export class GameStatusDto {
    gid: number;
    winnerUid: number;
    loserUid: number;
    winnerScore: number;
    loserScore: number;
    
    winnerNickname: string;
    loserNickname: string;
    
    createdAt: Date;

    static fromGameEntity(game: Game): GameStatusDto{
        const dto = new GameStatusDto();
        dto.gid = game.gid;
        dto.winnerUid = game.winnerUid;
        dto.loserUid = game.loserUid;
        dto.winnerScore = game.winnerScore;
        dto.loserScore = game.loserScore;

        dto.winnerNickname = game.winner.nickname;
        dto.loserNickname = game.loser.nickname;
        dto.createdAt = game.createdAt;
        return dto;
    }
}