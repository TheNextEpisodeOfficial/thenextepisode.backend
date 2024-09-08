import { Controller, Get, Header, Req, Res, UseGuards } from "@nestjs/common";
import { KakaoAuthGuard } from "./guard";
import { AuthService } from "./auth.service";
import { SocialUser, SocialUserAfterAuth } from "./auth.decorator";
import { Request, Response } from "express";
import axios from "axios";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SessionData } from "express-session";
import { Public } from "./public.decorator";
import { MbrService } from "@src/mbr/mbr.service";

@Controller("api/auth")
@ApiTags("Authorization")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mbrService: MbrService
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
    const { accessToken, refreshToken, isFirstLogin, user } =
      await this.authService.OAuthLogin({
        socialLoginDto: socialUser,
      });

    let session: SessionData = req.session;

    if (isFirstLogin) {
      // S : 최초 로그인의 경우 가입 화면으로 리다이렉트
      session.joinUser = user;
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}/join`);
      // E : 최초 로그인의 경우 가입 화면으로 리다이렉트
    } else {
      // S : 회원 상태 유효성 체크
      if (user.mbrSttCd != 1) {
        let redirectPath = "/";
        switch (user.mbrSttCd) {
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
            break;
          default:
            console.log("회원 상태가 유효하지 않습니다.");
            break;
        }
        res.redirect(`${process.env.LOGIN_REDIRECT_URL}/${redirectPath}`);
      }
      // E : 회원 상태 유효성 체크

      // S : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      const mbrAgree = await this.mbrService.getMbrAgree(user.id);
      if (
        mbrAgree.termsAcceptYn === "N" ||
        mbrAgree.privacyAcceptYn === "N" ||
        mbrAgree.advertisementYn === "N"
      ) {
        // S : 토큰 정보 세션에 임시저장
        session.tempToken = {
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
        session.loginUser = user;
        // E : 토큰 정보 세션에 임시저장
        res.redirect(`${process.env.LOGIN_REDIRECT_URL}/policyCheck`);
      }
      // E : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      // S : 필수 약관동의 여부 통과 시 로그인 완료
      else {
        session.loginUser = user;

        res.cookie("accessToken", accessToken);
        res.cookie("refreshToken", refreshToken);

        const isFavChecked =
          user.favGnr &&
          user.favGnr.length > 0 &&
          user.favPlnType &&
          user.favPlnType.length > 0;

        res.redirect(
          `${process.env.LOGIN_REDIRECT_URL}/savememberInfo?isFavChecked=${isFavChecked}`
        );
      }
      // E : 필수 약관동의 여부 통과 시 로그인 완료
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
    let session: SessionData = req.session;

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
  }

  /**
   * 토큰기반 로그인 유저 정보 조회
   * @param req
   * @returns
   */
  @Public()
  @Get("/getUserInfoByToken")
  @ApiOperation({
    summary: "토큰기반 로그인 유저 정보 조회",
    description: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
  })
  @ApiCreatedResponse({
    description: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
    type: null,
  })
  async getUserInfoByToken(@Req() req: Request) {
    const userInfo = await axios.get(this.DATA_URL, {
      headers: {
        Authorization: `Bearer ${req.cookies.accessToken}`,
      },
    });

    const mbr = await this.authService.getUserInfo(userInfo.data.id);

    let res = {
      title: "",
      message: "access token을 기반으로 mbr 테이블의 유저정보를 가져온다.",
      data: mbr,
      status: 200,
    };

    return res;
  }

  /**
   * 회원 약관 미동의 회원 로그인시 블록 후 약관동의 처리시 기본 정보 조회
   * @param req
   * @param res
   */
  @Public()
  @Get("/getMbrAgreeByTempToken")
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
    let session: SessionData = req.session;
    const userInfo = await axios.get(this.DATA_URL, {
      headers: {
        Authorization: `Bearer ${session.tempToken.accessToken}`,
      },
    });

    const tempMbr = await this.authService.getUserInfo(userInfo.data.id);
    return this.mbrService.getMbrAgree(tempMbr.id);
  }
}
