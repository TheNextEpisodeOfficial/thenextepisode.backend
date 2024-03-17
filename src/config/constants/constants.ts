import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgreConfigModule } from "../database/config.module";
import { PostgreConfigService } from "../database/config.service";

export const MODULE_CONFIG = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    imports: [PostgreConfigModule],
    useClass: PostgreConfigService,
    inject: [PostgreConfigService],
  }),
];
