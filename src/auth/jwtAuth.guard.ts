import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Reflector } from "@nestjs/core";
import { Response } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();
    const accessToken = request.cookies["accessToken"];
    const refreshToken = request.cookies["refreshToken"];

    if (!accessToken) {
      this.redirectToLogin(response);
      return false;
    }

    const valid = await this.authService.validateToken(accessToken);
    if (!valid) {
      if (!refreshToken) {
        this.redirectToLogin(response);
        return false;
      }

      try {
        const newAccessToken = await this.authService.refreshAccessToken(
          refreshToken
        );
        response.cookie("accessToken", newAccessToken, { httpOnly: true });
        return true;
      } catch (e) {
        this.redirectToLogin(response);
        return false;
      }
    }

    return true;
  }

  private redirectToLogin(response: Response) {
    response.redirect("/login");
  }
}
