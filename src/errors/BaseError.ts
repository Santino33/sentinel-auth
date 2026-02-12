export abstract class BaseError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  public toJSON() {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      message: this.message,
    };
  }
}
