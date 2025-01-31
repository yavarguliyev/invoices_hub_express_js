import { Request, Response } from 'express';

import { UserDto } from 'common/dto/user.dto';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ExpressContext {
  redisData?: { eventChannel: string, responseChannel: string };
  request: Request;
  response?: Response;
  tokenData: TokenPayload;
  currentUser?: UserDto;
  token: string;
}

export interface WithExpressContext extends ExpressContext {
  userRole?: string;
  roles?: string[];
  allowedRoles?: string[];
}
