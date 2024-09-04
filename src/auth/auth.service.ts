import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MbrService } from "@src/mbr/mbr.service";
import * as jwt from "jsonwebtoken";
import { SocialUserAfterAuth } from "./auth.decorator";

@Injectable()
export class AuthService {
  constructor(private readonly mbrService: MbrService) {}

  private readonly JWT_SECRET = "your_jwt_secret";
  private readonly JWT_REFRESH_SECRET = "your_jwt_refresh_secret"; // Refresh token secret

  async getUserInfo(mbrId: string) {
    return this.mbrService.getUserInfo(mbrId);
  }

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

    return { accessToken, refreshToken, isFirstLogin, user };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      jwt.verify(token, this.JWT_SECRET);
      return true;
    } catch (e) {
      return false;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.JWT_REFRESH_SECRET
      ) as jwt.JwtPayload & { email: string };
      const user = await this.mbrService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }
      const newAccessToken = jwt.sign({ email: user.email }, this.JWT_SECRET, {
        expiresIn: "1h",
      });
      return newAccessToken;
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
