import { Controller, Get, Header, Req, Res, UseGuards } from "@nestjs/common";
import { KakaoAuthGuard } from "./guard";
import { AuthService } from "./auth.service";
import { SocialUser, SocialUserAfterAuth } from "./auth.decorator";
import { Request, Response } from "express";
import axios from "axios";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SessionData } from "express-session";
import { Public } from "./public.decorator";

@Controller("api/auth")
@ApiTags("Authorization")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      // 최초 로그인의 경우 가입 화면으로 리다이렉트
      session.joinUser = user;
      res.redirect(`${process.env.LOGIN_REDIRECT_URL}/join`);
    } else {
      session.loginUser = user;

      res.cookie("accessToken", accessToken);
      res.cookie("refreshToken", refreshToken);

      res.redirect(`${process.env.LOGIN_REDIRECT_URL}/savememberInfo`);
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
    console.log("req.user::", req.user);

    console.log("accessToken::", req.cookies.accessToken);

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
}
