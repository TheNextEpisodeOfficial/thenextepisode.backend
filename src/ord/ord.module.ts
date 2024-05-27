import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdEntity } from "./entities/ord.entity";
import { OrdController } from "./ord.controller";
import { OrdService } from "./ord.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrdEntity])],
  controllers: [OrdController],
  providers: [OrdService],
})
export class OrdModule {}
