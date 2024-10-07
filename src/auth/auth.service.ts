import {ForbiddenException, Injectable, UnauthorizedException} from "@nestjs/common";
import { MbrService } from "@src/mbr/mbr.service";
import * as jwt from "jsonwebtoken";
import { SocialUserAfterAuth } from "./auth.decorator";
import { JwtService } from "@nestjs/jwt";
import { IJwtPayload } from "@src/auth/types/auth.types";
import process from "process";

@Injectable()
export class AuthService {
  constructor(
    private readonly mbrService: MbrService,
    private readonly jwtService: JwtService
  ) {}

  private readonly JWT_SECRET = "your_jwt_secret";
  private readonly JWT_REFRESH_SECRET = "your_jwt_refresh_secret";

  async OAuthLogin({
    socialLoginDto,
  }: {
    socialLoginDto: SocialUserAfterAuth;
  }) {
    const { id, email, mbrNm, gender, flatform, accessToken, refreshToken } =
      socialLoginDto;

    let user = await this.mbrService.findByEmail(email);
    let isFirstLogin = !user || user.mbrSttCd === 0;

    if (!user) {
      user = await this.mbrService.createMbr({
        chnlMbrId: id,
        mbrNm: mbrNm,
        email: email,
        gender: gender,
        mbrPhn: "",
        birth: "",
        mbrTypeCd: "",
        acntPltfrm: flatform,
        lstLgnTm: new Date(),
        mbrSttCd: 0,
      });
    }

    return {
      kakaoAccessToken: accessToken,
      kakaoRefreshToken: refreshToken,
      isFirstLogin,
      user,
    };
  }

  async generateNewToken(user: IJwtPayload) {
    const accessToken = this.jwtService.sign(
      user,
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      }
    );

    const refreshToken = this.jwtService.sign(
      user,
      {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      }
    );

    // TODO: redis에 key(mbrId), value(refreshToken) 저장 로직 구현

    return { accessToken, refreshToken };
  }

  async resignNewAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });

      // 사용자 존재 여부 확인
      const user = await this.mbrService.findByMbrId(payload.id);
      if (!user) {
        throw new UnauthorizedException("유효하지 않은 리프레시 토큰입니다.");
      }

      // S : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      const mbrAgree = await this.mbrService.getMbrAgree(user.id);

      // S : 필수 약관 동의 여부
      const invalidPolicy = (
          mbrAgree.termsAcceptYn === "N" ||
          mbrAgree.privacyAcceptYn === "N" ||
          mbrAgree.advertisementYn === "N"
      )
      // E : 필수 약관 동의 여부

      // 새로운 액세스 토큰 생성
      const newAccessToken = this.jwtService.sign({
        id: user.id,
        invalidPolicy: invalidPolicy,
        mbrSttCd: user.mbrSttCd
      }, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: '1h', // 필요에 따라 만료 시간 설정
      });

      return newAccessToken;
    } catch (error) {
      // 토큰 만료 여부 확인
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException("토큰이 만료되었습니다."); // 403 오류
      } else {
        throw new UnauthorizedException("리프레시 토큰 검증 실패."); // 기타 오류 처리
      }
    }
  }

  async validateMbr(res, mbrSttCd) {
    // S : 회원 상태 유효성 체크
    if (mbrSttCd != 1) {
      let redirectPath = "/";
      switch (mbrSttCd) {
        case 0:
          // 카카오 최초 로그인은 하였으나 가입이 완료되지 않음
          redirectPath = "/join";
          break;
        case 2:
          // 정지된 회원
          redirectPath = "/blocked";
          break;
        case 3:
          // 탈퇴한 회원
          // TODO: 회원 로그 테이블을 조회하여(e-mail과 플랫폼에서 제공하는 고유 ID 기준) 최근 탈퇴 일자가 1주 이상인 경우 /join으로 이동, 1주일 이내인 경우 /withdraw로 이동 구현하기
          break;
        default:
          throw new UnauthorizedException("회원 상태가 유효하지 않습니다.");
      }
      return {
        message: '회원 상태가 유효하지 않습니다.',
        redirectPath: redirectPath
      }
    } else {
      return {
        message: '유저 상태 정상',
        redirectPath: null
      }
    }
    // E : 회원 상태 유효성 체크
  }
}
