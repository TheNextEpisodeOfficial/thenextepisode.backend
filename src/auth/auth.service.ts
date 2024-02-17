import { Injectable } from "@nestjs/common";
import { MbrService } from "@src/mbr/mbr.service";
import { SocialUserAfterAuth } from "./auth.decorator";

@Injectable()
export class AuthService {
  constructor(
    private readonly mbrService: MbrService,
  ) {}

  async OAuthLogin({ socialLoginDto }: {socialLoginDto: SocialUserAfterAuth}) {
    const { id, email, mbrNm, accessToken, refreshToken } = socialLoginDto;

    let user = await this.mbrService.findByEmail(email);

    if (!user){
      user = await this.mbrService.createMbr({
        mbrId: id,
        mbrNm: mbrNm,
        email: email
      });
    }

    return { accessToken, refreshToken };
  }
}