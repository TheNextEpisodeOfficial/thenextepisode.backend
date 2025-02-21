import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";

export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ["account_email", "profile_nickname"],
    });
  }

  async validate(
    accessToken: string, 
    refreshToken: string, 
    profile: Profile
  ) {
    try {
      return {
        email: profile._json.kakao_account.email,
        id: String(profile.id),
        mbrNm: profile.username,
        gender: profile._json.kakao_account.gender,
        flatform: profile.provider,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch(error) {
      console.log(error)
    }
  }
}
