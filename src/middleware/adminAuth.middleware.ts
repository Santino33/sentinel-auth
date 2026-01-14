/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { AdminKeyRepository } from "../modules/adminKeys/adminKey.repository";
import { UnauthorizedError } from "../errors/HttpError";
import { AdminKeyDisabledError } from "../errors/AdminKeyError";
import { logger } from "../utils/logger";
import { verifyKey } from "../utils/keyGenerator";

const adminKeyRepository = new AdminKeyRepository(logger);

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const providedKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    
    const adminKeys = await adminKeyRepository.getAdminKeys();
    let matchedKeyEntity = null;

    for (const adminKey of adminKeys) {
      if (adminKey.key) {
        const match = await verifyKey(providedKey, adminKey.key);
        if (match) {
          matchedKeyEntity = adminKey;
          break;
        }
      }
    }

    if (!matchedKeyEntity) {
      throw new UnauthorizedError("Invalid admin key");
    }

    if (!matchedKeyEntity.is_active) {
      throw new AdminKeyDisabledError();
    }

    // @ts-ignore - Fallback if global augmentation is still not detected
    req.adminKey = {
        id: matchedKeyEntity.id,
        key: matchedKeyEntity.key,
        is_active: matchedKeyEntity.is_active
    };
    
    next();
  } catch (error) {
    next(error);
  }
};
