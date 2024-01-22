import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import * as mysqlDriver from "mysql2";

@Injectable()
export class MySqlConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      driver: mysqlDriver,
      type: "mysql",
      username: this.configService.get<string>("DB_USER"),
      password: this.configService.get<string>("DB_PASSWORD"),
      port: +this.configService.get<number>("DB_PORT"),
      host: this.configService.get<string>("DB_HOST"),
      database: this.configService.get<string>("DB_SCHEMA"),
      entities: ["/src/entities/*.entity.ts"],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    };
  }
}
