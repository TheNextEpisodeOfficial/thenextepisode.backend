import { Controller, Get, Header, Req, Res, UseGuards } from "@nestjs/common";
import { KakaoAuthGuard } from "./guard";
import { AuthService } from "./auth.service";
import { SocialUser, SocialUserAfterAuth } from "./auth.decorator";
import { Request, Response } from "express";
import axios from "axios";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("/auth")
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly DATA_URL = "https://kapi.kakao.com/v2/user/me";

  @ApiOperation({
    summary: "카카오 로그인",
    description: "카카오 서비스로 로그인을 요청한다.",
  })
  @UseGuards(KakaoAuthGuard)
  @Get("/login/kakao")
  async kakaoCallback(
    @SocialUser() socialUser: SocialUserAfterAuth,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken, refreshToken, isFirstLogin, user } =
      await this.authService.OAuthLogin({
        socialLoginDto: socialUser,
      });

    console.log("accessToken, refreshToken::", accessToken, refreshToken);

    res.cookie("refreshToken", refreshToken);
    res.cookie("accessToken", accessToken);

    if (isFirstLogin) {
      res.redirect("http://localhost:4200/join");
    } else {
      res.redirect("http://localhost:4200/savememberInfo");
    }
  }

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
