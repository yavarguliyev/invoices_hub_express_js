import { Request, Response } from 'express';

import { UserDto } from 'domain/dto/user.dto';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticationInfo {
  info?: object | string | Array<string | undefined>
}

export interface ExpressContext {
  redisData?: { eventChannel: string, responseChannel: string };
  request: Request;
  response?: Response;
  tokenData: JwtPayload;
  currentUser?: UserDto;
  token: string;
}

export interface WithExpressContext extends ExpressContext {
  userRole?: string;
  roles?: string[];
  allowedRoles?: string[];
}
