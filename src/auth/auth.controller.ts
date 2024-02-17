import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { KakaoAuthGuard } from "./guard";
import { AuthService } from "./auth.service";
import { SocialUser, SocialUserAfterAuth } from "./auth.decorator";
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(KakaoAuthGuard)
  @Get('login/kakao')
  async kakaoCallback(
    @SocialUser() socialUser: SocialUserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.OAuthLogin({
      socialLoginDto: socialUser,
    });

    console.log("accessToken, refreshToken::", accessToken, refreshToken)

    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);

    res.redirect('/api-docs');
  }
}