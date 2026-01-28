import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/HttpError";

export function requireBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("Request body is required");
  }

  next();
}


export function requireParams(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    if (!req.params || Object.keys(req.params).length === 0) {
        throw new BadRequestError("Request params is required");
    }

    next();
}