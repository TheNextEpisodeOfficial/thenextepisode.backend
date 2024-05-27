import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdItemEntity } from "./entities/ordItem.entity";
import { OrdItemController } from "./ordItem.controller";
import { OrdItemService } from "./ordItem.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrdItemEntity])],
  controllers: [OrdItemController],
  providers: [OrdItemService],
})
export class OrdItemModule {}
