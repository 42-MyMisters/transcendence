import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";

export class UserRepository extends Repository<User> {
	constructor(
		@InjectRepository(User) private dataSource: DataSource) {
			super(User, dataSource.manager)
		};

	// login

}