import { WithExpressContext } from '../src/value-objects/interfaces/express-context.interface';

declare global {
  namespace Express {
    interface Request extends WithExpressContext {};
  }
}
