import { Injectable } from "@nestjs/common";
import { MbrService } from "@src/mbr/mbr.service";
import { SocialUserAfterAuth } from "./auth.decorator";

@Injectable()
export class AuthService {
  constructor(private readonly mbrService: MbrService) {}

  async OAuthLogin({
    socialLoginDto,
  }: {
    socialLoginDto: SocialUserAfterAuth;
  }) {
    const { id, email, mbrNm, gender, flatform, accessToken, refreshToken } =
      socialLoginDto;

    let user = await this.mbrService.findByEmail(email);
    let isFirstLogin = !user || user.nickNm || user.dncrYn ? true : false;

    if (isFirstLogin) {
      user = await this.mbrService.createMbr({
        mbrId: id,
        mbrNm: mbrNm,
        email: email,
        gender: gender,

        mbrPhn: "",
        birth: "",
        mbrTypeCd: "",

        acntPltfrm: flatform,
        lstLgnTm: new Date(),
        mbrSttCd: "",
      });
    }

    return { accessToken, refreshToken, isFirstLogin };
  }
}
