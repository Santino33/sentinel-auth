import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/BaseError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unexpected errors
  console.error(`[Unexpected Error]: ${err.message}`, err.stack);
  
  return res.status(500).json({
    statusCode: 500,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};
