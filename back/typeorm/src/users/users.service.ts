/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
	@InjectRepository(User)
	// private usersRepository: Repository<User>,
	private dataSource: DataSource,
	) {}

	// findAll(): Promise<User[]> {
	// return this.usersRepository.find();
	// }

	// findOne(id: number): Promise<User> {
	// return this.usersRepository.findOneBy({ id });
	// }

	// async remove(id: string): Promise<void> {
	// await this.usersRepository.delete(id);
	// }

	/*
	async createMany(users: User[]) { // NOTE : alternatively, callback-style functions are 'Subscribers'
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		try {
		  await queryRunner.manager.save(users[0]);
		  await queryRunner.manager.save(users[1]);

		  await queryRunner.commitTransaction();
		} catch (err) {
		  // since we have errors lets rollback the changes we made
		  await queryRunner.rollbackTransaction();
		} finally {
		  // you need to release a queryRunner which was manually instantiated
		  await queryRunner.release();
		}
	  }
	  */

	  async createMany(users: User[]) { // NOTE: Subscribers
		await this.dataSource.transaction(async manager => {
		  await manager.save(users[0]);
		  await manager.save(users[1]);
		});
	  }

}

