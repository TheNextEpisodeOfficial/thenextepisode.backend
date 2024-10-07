import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {KakaoAuthGuard} from "./guard";
import {AuthService} from "./auth.service";
import {SocialUser, SocialUserAfterAuth} from "./auth.decorator";
import {Request, Response} from "express";
import axios from "axios";
import {ApiCreatedResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {SessionData} from "express-session";
import {Public} from "./public.decorator";
import {MbrService} from "@src/mbr/mbr.service";
import {JwtService} from "@nestjs/jwt";
import * as process from "process";
import {JwtAuthGuard} from "@src/auth/jwtAuth.guard";

@Controller("api/auth")
@ApiTags("Authorization")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mbrService: MbrService,
    private readonly jwtService: JwtService
  ) {}

  private readonly DATA_URL = "https://kapi.kakao.com/v2/user/me";

  /**
   * 카카오 로그인
   * @param socialUser
   * @param req
   * @param res
   */
  @ApiOperation({
    summary: "카카오 로그인",
    description: "카카오 서비스로 로그인을 요청한다.",
  })
  @Public()
  @UseGuards(KakaoAuthGuard)
  @Get("login/kakao")
  async kakaoCallback(
    @SocialUser() socialUser: SocialUserAfterAuth,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { kakaoAccessToken, kakaoRefreshToken, isFirstLogin, user } =
      await this.authService.OAuthLogin({
        socialLoginDto: socialUser,
      });

    let session: SessionData = req.session;

    if (isFirstLogin) {
      // S : 최초 로그인의 경우 가입 화면으로 리다이렉트
      session.joinUser = user;
      return res.redirect(`${process.env.LOGIN_REDIRECT_URL}/join`);
      // E : 최초 로그인의 경우 가입 화면으로 리다이렉트
    } else {
      // S : 회원 상태 유효성 체크
      const validateMbr = await this.authService.validateMbr(res, user.mbrSttCd);
      if(validateMbr.redirectPath) {
        return res.redirect(`${process.env.LOGIN_REDIRECT_URL}${validateMbr.redirectPath}`);
      }

      // E : 회원 상태 유효성 체크

      // S : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      const mbrAgree = await this.mbrService.getMbrAgree(user.id);

      // S : 필수 약관 동의 여부
      const invalidPolicy = (
          mbrAgree.termsAcceptYn === "N" ||
          mbrAgree.privacyAcceptYn === "N" ||
          mbrAgree.advertisementYn === "N"
      )
      // E : 필수 약관 동의 여부

      // S : 토큰 생성 및 쿠키 세팅
      const { accessToken, refreshToken } = await this.authService.generateNewToken(
    {
            id: user.id,
            invalidPolicy: invalidPolicy,
            mbrSttCd: user.mbrSttCd
          }
      );
      res.cookie("accessToken", accessToken, {});
      res.cookie("refreshToken", refreshToken, {});
      // E : 토큰 생성 및 쿠키 세팅

      // S : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      if(invalidPolicy) {
        return res.redirect(`${process.env.LOGIN_REDIRECT_URL}/policyCheck`);
      }
      // E : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)

      // 관심 행사타입 & 장르가 설정되어 있는지 여부 (선택되어 있지 않으면 설정화면으로 리다이렉트)
      const isFavChecked =
          user.favGnr &&
          user.favGnr.length > 0 &&
          user.favPlnType &&
          user.favPlnType.length > 0;

      return res.redirect(`${process.env.LOGIN_REDIRECT_URL}/savememberInfo?isFavChecked=${isFavChecked}`);

    }
  }

  /**
   * 카카오 로그아웃
   * @param req
   * @param res
   */
  @ApiOperation({
    summary: "카카오 로그아웃",
    description: "카카오 서비스의 로그아웃을 요청한다.",
  })
  @Get("logout/kakao")
  async kakaoLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    // 카카오 로그아웃 요청 처리
    const kakakoAccessToken = req.cookies.kakakoAccessToken;
    if (!kakakoAccessToken) {
      throw new HttpException(
        "kakaoAccessToken이 존재하지 않습니다.",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (kakakoAccessToken) {
      await axios.post("https://kapi.kakao.com/v1/user/logout", null, {
        headers: { Authorization: `Bearer ${kakakoAccessToken}` },
      });
    }

    // 쿠키에서 JWT 삭제
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).send("Logged out");
  }

  /**
   * 토큰기반 로그인 유저 정보 조회
   * @param req
   * @returns
   */
  @Public()
  @Get("/getUserInfoByToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "토큰기반 로그인 유저 정보 조회",
    description: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
    type: null,
  })
  async getUserInfoByToken(@Req() req: Request) {
    return {
      title: "",
      message: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
      data: req.user,
      status: 200,
    };
  }

  /**
   * 회원 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회
   * @param req
   */
  @Public()
  @Get("/getMbrAgreeByTempToken")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      "필수 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회",
    description:
      "필수 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회.",
  })
  @ApiCreatedResponse({
    description:
      "회원 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회",
    type: null,
  })
  async getMbrAgreeByTempToken(@Req() req) {
    return this.mbrService.getMbrAgree(req.user.id);
  }


  @Public()
  @Post("/resignNewAccessToken")
  @ApiOperation({
    summary:
        "AccessToken 만료시 RefreshToken으로 AccessToken 재발급",
    description:
        "AccessToken 만료시 RefreshToken으로 AccessToken 재발급",
  })
  @ApiCreatedResponse({
    description:
        "회원 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회",
    type: null,
  })
  async resignNewAccessToken(
      @Body() body: { refreshToken: string },
      @Res() res: Response
  ) {
    console.log(body.refreshToken)
    const refreshToken = body.refreshToken;

    if(!refreshToken) {
      throw new HttpException(
          "refreshToken이 없습니다.",
          HttpStatus.BAD_REQUEST
      );
    }

    const newAccessToken = await this.authService.resignNewAccessToken(refreshToken);

    if(newAccessToken) {
      res.cookie("accessToken", newAccessToken, {});
      return res.status(200).send({ message: 'Access token 재발급 완료' });
    } else {
      throw new HttpException(
          "토큰 재발급 실패",
          HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
