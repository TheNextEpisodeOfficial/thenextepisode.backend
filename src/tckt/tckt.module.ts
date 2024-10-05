import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdItemEntity } from "@src/ordItem/entities/ordItem.entity";
import { TcktEntity } from "./entities/tckt.entity";
import { TcktController } from "./tckt.controller";
import { TcktService } from "./tckt.service";
import { MbrModule } from "@src/mbr/mbr.module";
import {AuthModule} from "@src/auth/auth.module";
@Module({
  imports: [TypeOrmModule.forFeature([TcktEntity, OrdItemEntity]), MbrModule, AuthModule],
  controllers: [TcktController],
  providers: [TcktService],
})
export class TcktModule {}
