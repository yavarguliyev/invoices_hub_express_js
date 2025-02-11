import { Strategy } from 'passport-jwt';

import { BaseAuthStrategy } from 'application/helpers/auth-strategies.helper.ts/base-auth-strategy';
import { JwtAuthStrategy } from 'application/helpers/auth-strategies.helper.ts/jwt-auth-strategy';
import AuthStrategyType from 'core/types/auth-strategies.type';

export class AuthStrategiesInfrastructure {
  private static strategyInstances: Record<AuthStrategyType, BaseAuthStrategy> = {
    [AuthStrategyType.JWT]: new JwtAuthStrategy()
  };

  static buildStrategies (): Strategy[] {
    return Object.values(AuthStrategiesInfrastructure.strategyInstances).map((strategy) => {
      const strategies: Strategy[] = [];
      strategy.applyStrategy(strategies);

      return strategies;
    }).flat();
  }
}
