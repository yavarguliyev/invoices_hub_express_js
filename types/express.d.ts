import { WithExpressContext } from '../src/domain/interfaces/express-context.interface';

declare global {
  namespace Express {
    interface Request extends WithExpressContext {};
  }
}
