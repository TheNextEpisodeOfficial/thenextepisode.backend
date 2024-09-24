import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MbrService } from "@src/mbr/mbr.service";
import * as process from "process";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mbrService: MbrService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<any>();

    //headear에 토큰이 있는지 확인
    const { authorization } = request.headers;

    if (!authorization) {
      throw new UnauthorizedException("액세스 토큰이 필요한 작업입니다.");
    }

    //authorization 값을 추출하고 이 값이 bearer로 시작하는지 검사
    const isBearer = authorization.startsWith("Bearer");
    if (!isBearer) {
      throw new UnauthorizedException("Bearer 토큰이 아닙니다.");
    }

    const accessToken = authorization.split(" ").pop();
    if (!accessToken) {
      throw new UnauthorizedException("토큰을 찾을 수 없습니다.");
    }

    try {
      //토큰 검증 및 토큰에서 추출된 정보 얻어오기
      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      });

      // 존재하는 id인지 검증
      const user = await this.mbrService.findByMbrId(payload.id);
      if (!user) {
        throw new UnauthorizedException("사용할 수 없는 토큰입니다.");
      }

      request.user = user;
    } catch {
      throw new UnauthorizedException("사용할 수 없는 토큰 입니다.");
    }

    //모든 작업이 완료되면 true 만약 반환값이 false이면 요청처리 중단
    return true;
  }
}
