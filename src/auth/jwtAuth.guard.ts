import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MbrService } from "@src/mbr/mbr.service";
import * as process from "process";
import { AuthService } from "@src/auth/auth.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
      private readonly jwtService: JwtService,
      private readonly authService: AuthService,
      private readonly mbrService: MbrService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<any>();
    const res = context.switchToHttp().getResponse<any>();

    const { authorization, 'X-Refresh-Token': refreshToken } = req.headers;
    console.log("req.headers:", req.headers)
    console.log("authorization:", authorization)

    if (!authorization) {
      throw new UnauthorizedException("액세스 토큰이 필요한 작업입니다.");
    }

    const isBearer = authorization.startsWith("Bearer");
    if (!isBearer) {
      throw new UnauthorizedException("Bearer 토큰이 아닙니다.");
    }

    const accessToken = authorization.split(" ").pop();
    if (!accessToken) {
      throw new UnauthorizedException("토큰을 찾을 수 없습니다.");
    }

    try {
      // 액세스 토큰 검증
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });

      // 사용자 존재 여부 확인
      const user = await this.mbrService.findByMbrId(payload.id);
      if (!user) {
        throw new UnauthorizedException("사용할 수 없는 토큰입니다.");
      }

      // invalidPolicy가 true일 때 특정 API만 허용
      if (payload.invalidPolicy) {
        const allowedUrls = [
          "/api/auth/getMbrAgreeByTempToken",
          "/mbr/updateMbrAgree",
          "/api/auth/getUserInfoByToken",
        ];

        if (!allowedUrls.includes(req.url)) {
          // return res.redirect(`${process.env.LOGIN_REDIRECT_URL}/policyCheck`);
          throw new UnauthorizedException("필수 약관 동의가 필요합니다.");
        }
      }

      // 회원 상태 유효성 검증
      const validateMbr = await this.authService.validateMbr(res, payload.mbrSttCd);
      if(validateMbr.redirectPath) {
        return res.status(403).json(validateMbr);
      }
      req.user = user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // 토큰 만료 예외를 명시적으로 던짐
        throw new UnauthorizedException('액세스 토큰이 만료되었습니다.');
      } else {
        // 그 외의 에러는 그대로 처리
        return error
      }
    }

    return true; // 모든 것이 정상일 경우 접근 허용
  }


}