import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { KakaoStrategy } from "./kakao";
import { MbrModule } from "@src/mbr/mbr.module";

@Module({
  imports: [
    JwtModule.register({
      secret: "TNE_JWT_SECERET",
      global: true,
      signOptions: { expiresIn: "300s" },
    }),
    forwardRef(() => MbrModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, KakaoStrategy],
  exports: [AuthService],
})
export class AuthModule {}
