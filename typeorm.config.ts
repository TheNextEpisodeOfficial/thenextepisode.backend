import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const dataSource: DataSource = new DataSource({
  type: "postgres",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  host: process.env.DB_HOST,
  database: process.env.DB_SCHEMA,
  entities: ["src/**/entities/*.ts"],
  migrations: ["src/migration/*.ts"],
  subscribers: ["src/subscriber/*.ts"],
  synchronize: false,
  logging: true
});

export default dataSource;

// 마이그 제너레이트 파일 생성 :  npm run typeorm migration:generate ./src/migration/마이그레이션파일명 -- -d typeorm.config.ts
// 마이그 파일기반 DB 스키마 생성 : npm run typeorm migration:run -- -d typeorm.config.ts
