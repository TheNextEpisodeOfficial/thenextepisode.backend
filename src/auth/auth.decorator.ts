import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface SocialUserAfterAuth {
  email: string;
  id: string;
  mbrNm: string;
  accessToken: string,
  refreshToken: string
}