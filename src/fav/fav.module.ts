import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MbrModule } from "@src/mbr/mbr.module";
import { AuthModule } from "@src/auth/auth.module";
import { FavEntity } from "@src/fav/entities/fav.entity";
import { FavController } from "@src/fav/fav.controller";
import { FavService } from "@src/fav/fav.service";

@Module({
  imports: [TypeOrmModule.forFeature([FavEntity]), MbrModule, AuthModule],
  controllers: [FavController],
  providers: [FavService],
  exports: [FavService],
})
export class FavModule {}
