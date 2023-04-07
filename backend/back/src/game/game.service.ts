import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Game } from "./game.entity";

@Injectable()
export class GameService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		private jwtService: JwtService,
	){}

}