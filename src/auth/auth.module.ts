import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { KakaoStrategy } from "./kakao";
import { MbrModule } from "@src/mbr/mbr.module";
import { MbrService } from "@src/mbr/mbr.service";
import { MbrEntity } from "@src/mbr/entities/mbr.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [JwtModule.register({}), MbrModule],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy],
})
export class AuthModule {}
