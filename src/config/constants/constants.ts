import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgreConfigModule } from "../database/config.module";
import { PostgreConfigService } from "../database/config.service";
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from "nestjs-i18n";
import path, { join } from "path";
import { ConfigService } from "@nestjs/config";

export const MODULE_CONFIG = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({
    imports: [PostgreConfigModule],
    useClass: PostgreConfigService,
    inject: [PostgreConfigService],
  }),
  I18nModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      fallbackLanguage: "ko-KR",
      fallbacks: {
        "en-US": "en-US",
        "ko-KR": "ko-KR",
        "ja-JP": "ja-JP",
        "zh-CN": "zh-CN",
      },
      loaderOptions: {
        path: join(__dirname, "../../../i18n"),
        watch: true,
      },
    }),
    resolvers: [
      { use: QueryResolver, options: ["lang"] },
      AcceptLanguageResolver,
      new HeaderResolver(["x-lang"]),
    ],
    inject: [ConfigService],
  }),
];
