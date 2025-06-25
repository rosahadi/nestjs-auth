import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';

@Injectable()
export class TokenUtils {
  constructor(private configService: ConfigService) {}

  setCookieToken(res: Response, token: string): void {
    const cookieExpiresInDays = parseInt(
      this.configService.get('JWT_COOKIE_EXPIRES_IN') || '7',
      10,
    );

    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/',
    };

    res.cookie('airbnbCloneJWT', token, cookieOptions);
  }

  createSendToken(
    user: User,
    statusCode: number,
    res: Response,
    token: string,
  ): any {
    this.setCookieToken(res, token);

    const userResponse = { ...user } as Partial<User>;
    delete userResponse.password;

    return {
      user: userResponse,
    };
  }
}
