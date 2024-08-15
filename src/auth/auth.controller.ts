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
      // S : 최초 로그인의 경우 가[입 화면으로 리다이렉트
      session.joinUser = user;
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}/join`);
      // E : 최초 로그인의 경우 가[입 화면으로 리다이렉트
    } else {
      // S : 로그인 정보 세션에 임시저장
      session.loginUser = user;
      session.tempToken.accessToken = accessToken;
      session.tempToken.refreshToken = refreshToken;
      // E : 로그인 정보 세션에 임시저장

      // S : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      const mbrAgree = await this.mbrService.getMbrAgree(user.id);
      if (
        mbrAgree.termsAcceptYn === "N" ||
        mbrAgree.privacyAcceptYn === "N" ||
        mbrAgree.advertisementYn === "N"
      ) {
        res.redirect(`${process.env.LOGIN_REDIRECT_URL}/policyCheck`);
      }
      // E : 필수 약관동의 여부 확인 (미동의 시 약관동의 화면으로 리다이렉트)
      // S : 필수 약관동의 여부 통과 시 로그인 완료
      else {
        res.cookie("accessToken", accessToken);
        res.cookie("refreshToken", refreshToken);

        res.redirect(`${process.env.LOGIN_REDIRECT_URL}/savememberInfo`);
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
   * 토큰 저장 후 회원정보 저장 페이지로 이동
   * @param req
   * @param res
   */
  @Public()
  @Get("/saveToken")
  @ApiOperation({
    summary: "토큰 저장",
    description: "토큰 저장 후 회원정보 저장 페이지로 이동한다.",
  })
  @ApiCreatedResponse({
    description: "토큰 저장 후 회원정보 저장 페이지로 이동한다.",
    type: null,
  })
  async saveToken(@Req() req: Request, @Res() res: Response) {
    let session: SessionData = req.session;

    res.cookie("accessToken", session.tempToken.accessToken);
    res.cookie("refreshToken", session.tempToken.refreshToken);

    if (session.tempToken.accessToken && session.tempToken.refreshToken) {
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}/savememberInfo`);
    } else {
      console.log("session.tempToken이 없습니다.");
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}`);
    }
  }
}
