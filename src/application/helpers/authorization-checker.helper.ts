import { Action } from 'routing-controllers';
import passport from 'passport';

import { NotAuthorizedError } from 'core/errors';
import { ExpressContext, TokenPayload } from 'domain/interfaces/express-context.interface';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { IUserService } from 'application/services/user.service';
import { ContainerItems } from 'application/ioc/static/container-items';
import { UserDto } from 'domain/dto/user.dto';

export const getTokenData = (req: Request): Promise<TokenPayload> =>
  new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false, failureFlash: false, failWithError: true }, (err: any, payload: any, info: any) => {
      if (err) reject(err);
      if (payload) resolve(payload);
      if (info) reject(new NotAuthorizedError());
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

  if (!context?.currentUser?.role?.name || roles.length === 0 || !roles.includes(context?.currentUser.role.name)) {
    throw new NotAuthorizedError();
  }

  return true;
};
