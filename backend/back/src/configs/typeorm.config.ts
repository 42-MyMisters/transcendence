import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import config from 'config';

const dbConfig : any = config.get('db');

export const typeORMConfig : TypeOrmModuleOptions = {
	// logging: true,
	// logger: 'advanced-console', //query check
	type: dbConfig.type,
	host: process.env.RDS_HOSTNAME || dbConfig.host,
	port: process.env.RDS_PORT || dbConfig.port,
	username: process.env.RDS_USERNAME || dbConfig.username,
	password: process.env.RDS_PASSWORD || dbConfig.password,
	database: process.env.RDS_DATABASE || dbConfig.database,
	entities: [__dirname + '/../**/*.entity.{js,ts}'], //엔티티를 이용해서 DB 테이블을 생성(엔티티 파일이 어디있는지 정해줌)
	synchronize: dbConfig.synchronize, // 애플리케이션을 다시 실행할대, 엔티티안에서 수정된 컬럼 타입 변경값등을 테이블 drop 후 변경사항 수정
}
