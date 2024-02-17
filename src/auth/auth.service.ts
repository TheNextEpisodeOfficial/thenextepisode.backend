import { Injectable } from "@nestjs/common";
import { MbrService } from "@src/mbr/mbr.service";
import { SocialUserAfterAuth } from "./auth.decorator";

@Injectable()
export class AuthService {
  constructor(
    private readonly mbrService: MbrService,
  ) {}

  async OAuthLogin({ socialLoginDto }: {socialLoginDto: SocialUserAfterAuth}) {
    const { email } = socialLoginDto;

    console.log('socialLoginDto:::', socialLoginDto)
    let user = await this.mbrService.findByEmail(email);

    if (!user){
      user = await this.mbrService.createMbr({
        mbrNm: '',
        email: ''
      });
    }

    const accessToken = 'at'
    const refreshToken = 'rt'
    // const accessToken = this.getAccessToken(user.id);
    // const refreshToken = this.getRefreshToken(user.id);

    return { accessToken, refreshToken };
  }
}