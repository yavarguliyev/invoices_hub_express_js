abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract reason: string;

  constructor (message: string, public details?: Record<string, any>) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors (): { message: string; field?: string; reason: string; details?: Record<string, any> }[];
}

export { CustomError };
