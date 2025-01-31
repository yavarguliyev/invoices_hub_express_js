import { WithExpressContext } from '../src/common/interfaces/express-context.interface';

declare global {
  namespace Express {
    interface Request extends WithExpressContext {};
  }
}
