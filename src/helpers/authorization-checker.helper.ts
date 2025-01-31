import { Action } from 'routing-controllers';
import passport from 'passport';

import { NotAuthorizedError } from 'errors';
import { ExpressContext } from 'common/interfaces/express-context.interface';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { IUserService } from 'services/user.service';
import { ContainerItems } from 'ioc/static/container-items';
import { UserDto } from 'common/dto/user.dto';

export const getTokenData = (req: Request): Promise<UserDto> =>
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

  const expressContext: ExpressContext = {
    request,
    tokenData: tokenData as any,
    token
  };

  const userService = ContainerHelper.get<IUserService>(ContainerItems.IUserService);
  const user = await userService.getBy({ id: tokenData.id });

  if (user?.payload) {
    expressContext.currentUser = user.payload;
  }

  return expressContext;
};

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
  const context = await generateExpressContext(action);

  if (!context?.currentUser?.role?.name || roles.length === 0 || !roles.includes(context?.currentUser.role.name)) {
    throw new NotAuthorizedError();
  }

  return true;
};
