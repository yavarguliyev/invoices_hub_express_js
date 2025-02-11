import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest, VerifiedCallback } from 'passport-jwt';

import AuthStrategyType from 'core/types/auth-strategies.type';
import { BaseAuthStrategy } from 'application/helpers/auth-strategies.helper.ts/base-auth-strategy';
import { JwtPayload } from 'domain/interfaces/express-context.interface';

export interface IBaseAuthStrategy {
  isTypeOfAuthStrategy (options: AuthStrategyType): boolean;
};

export class JwtAuthStrategy extends BaseAuthStrategy {
  currentStrategy: AuthStrategyType = AuthStrategyType.JWT;

  applyStrategy (strategies: Strategy[]): void {
    strategies.push(new Strategy(this.jwtStrategyOptions(), async (payload: JwtPayload, done: VerifiedCallback) => done(null, payload)));
  }

  private jwtStrategyOptions (): StrategyOptionsWithoutRequest {
    return { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET_KEY! };
  }
};
