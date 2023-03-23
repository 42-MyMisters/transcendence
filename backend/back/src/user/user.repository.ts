import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity";

export class UserRepository extends Repository<User> {
	constructor(
		@InjectRepository(User) private dataSource: DataSource) {
			super(User, dataSource.manager)
		};

	async getUserById(uid: number) : Promise<User> {
		const user = await this.findOneBy({uid});
		if (!user) {
			throw new NotFoundException("Can't find the user");
		}
		return user;
	}

}