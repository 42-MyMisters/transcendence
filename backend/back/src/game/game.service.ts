import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class GameService {
	constructor(
		private jwtService: JwtService,
	){}

}