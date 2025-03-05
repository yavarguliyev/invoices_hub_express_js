import { Action } from 'routing-controllers';
import passport from 'passport';

import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { IUserService } from 'application/services/user.service';
import { NotAuthorizedError } from 'core/errors';
import { UserDto } from 'domain/dto/user.dto';
import { AuthenticationInfo, ExpressContext, JwtPayload } from 'domain/interfaces/express-context.interface';

export const getTokenData = (req: Request): Promise<JwtPayload> =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false, failureFlash: false, failWithError: true }, (err: Error, payload: JwtPayload, info: AuthenticationInfo) => {
      if (err) reject(err);
      if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) return reject(new NotAuthorizedError());
      if (info) return reject(new NotAuthorizedError());

      resolve({ id: payload.id, email: payload.email, role: payload.role });
    }
    )(req);
});

export const generateExpressContext = async (action: Action) => {
  const { request } = action;
  const token = request.headers.authorization?.split(' ')[1] ?? '';

  if (!token) {
    throw new NotAuthorizedError();
  }

  const tokenData = await getTokenData(request);

  const expressContext: ExpressContext = { request, tokenData, token };
  const userService = ContainerHelper.get<IUserService>(ContainerItems.IUserService);

  const user = await userService.getBy({ id: tokenData.id });

  if (user?.payload) {
    expressContext.currentUser = user.payload;
  }

  return expressContext;
};

export const currentUserChecker = async (action: Action): Promise<UserDto> => {
  const context = await generateExpressContext(action);

  if (!context?.currentUser) {
    throw new NotAuthorizedError();
  }

  return context.currentUser;
};

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
  const context = await generateExpressContext(action);
  const currentUserRoleName = context?.currentUser?.role?.name;
  const role = context.tokenData.role;

  if (!currentUserRoleName || roles.length === 0 || !roles.includes(role)) {
    throw new NotAuthorizedError();
  }

  return true;
};
