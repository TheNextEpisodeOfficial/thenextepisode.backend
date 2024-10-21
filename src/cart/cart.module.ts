import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartEntity } from "./entities/cart.entity";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import {MbrModule} from "@src/mbr/mbr.module";
import {AuthModule} from "@src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity]), MbrModule, AuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
