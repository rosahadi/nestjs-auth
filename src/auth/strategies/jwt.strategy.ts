import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { TypedConfigService } from 'src/config/typed-config.service';
import { AuthConfig } from 'src/config/auth.config';
import { RequestWithCookies } from 'src/types/express';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/user/role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  roles?: Role[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: TypedConfigService,
    private readonly usersService: UserService,
  ) {
    const auth = config.get<AuthConfig>('auth');

    if (!auth) {
      throw new Error('Auth config not found');
    }

    const jwtFromRequest = (req: RequestWithCookies) => {
      if (req.cookies?.airbnbCloneJWT) {
        return req.cookies.airbnbCloneJWT;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: auth.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}
