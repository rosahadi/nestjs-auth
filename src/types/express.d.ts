import { Request, Response } from 'express';
import { User } from 'src/user/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface RequestWithCookies extends Request {
  cookies: {
    airbnbCloneJWT?: string;
  };
}

export interface GqlContext {
  req: Request;
  res: Response;
}
