import { Controller, Get, Header, Req, Res, UseGuards } from "@nestjs/common";
import { KakaoAuthGuard } from "./guard";
import { AuthService } from "./auth.service";
import { SocialUser, SocialUserAfterAuth } from "./auth.decorator";
import { Request, Response } from "express";
import axios from "axios";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly DATA_URL = "https://kapi.kakao.com/v2/user/me";

  @UseGuards(KakaoAuthGuard)
  @Get("login/kakao")
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

    // res.send({
    //   user: user,
    //   isFirstLogin: isFirstLogin,
    // });

    res.redirect("/api-docs");
  }

  @Get("getUserInfo")
  async getUserInfo(@Req() req: Request, @Res() res: Response): Promise<void> {
    const userInfo = await axios.get(this.DATA_URL, {
      headers: {
        Authorization: `Bearer ${req.cookies.accessToken}`,
      },
    });

    res.send(userInfo.data);
  }
}