import { Request } from 'express';

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
  request: Request;
  tokenData: JwtPayload;
  currentUser?: UserDto;
  token: string;
}

export interface WithExpressContext extends ExpressContext {
  userRole?: string;
  roles?: string[];
  allowedRoles?: string[];
}
