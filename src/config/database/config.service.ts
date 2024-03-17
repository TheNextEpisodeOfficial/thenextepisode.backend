import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import * as pg from "pg";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

@Injectable()
export class PostgreConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      username: this.configService.get<string>("DB_USER"),
      password: this.configService.get<string>("DB_PASSWORD"),
      port: +this.configService.get<number>("DB_PORT"),
      host: this.configService.get<string>("DB_HOST"),
      database: this.configService.get<string>("DB_SCHEMA"),
      entities: ["/src/entities/*.entity.ts"],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
      extra: {
        driver: pg,
      },
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}
