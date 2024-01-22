import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MySqlConfigModule } from "../database/config.module";
import { MySqlConfigService } from "../database/config.service";

export const MODULE_CONFIG = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    imports: [MySqlConfigModule],
    useClass: MySqlConfigService,
    inject: [MySqlConfigService],
  }),
];
