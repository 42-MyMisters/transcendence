import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeORMConfig : TypeOrmModuleOptions = {
	// logging: true,
	// logger: 'advanced-console', //query check
	type: "postgres",
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DB,
	entities: [__dirname + '/../**/*.entity.{js,ts}'], //엔티티를 이용해서 DB 테이블을 생성(엔티티 파일이 어디있는지 정해줌)
	synchronize: Boolean(process.env.DB_SYNCHRONIZE), // 애플리케이션을 다시 실행할대, 엔티티안에서 수정된 컬럼 타입 변경값등을 테이블 drop 후 변경사항 수정
}
