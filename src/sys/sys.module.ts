import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MODULE_CONFIG } from "@src/config/constants/constants";
import { SysDictEntity } from "./entities/sysDict.entity";
import { SysDictItemEntity } from "./entities/sysDictItem.entity";
import { SysController } from "./sys.controller";
import { SysService } from "./sys.service";

@Module({
  imports: [TypeOrmModule.forFeature([SysDictEntity, SysDictItemEntity])],
  controllers: [SysController],
  providers: [SysService],
})
export class SysModule {}
