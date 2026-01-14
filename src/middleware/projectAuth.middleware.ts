/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { ProjectRepository } from "../modules/projects/project.repository";
import { UnauthorizedError } from "../errors/HttpError";
import { ProjectDisabledError, ProjectNotFoundError } from "../errors/ProjectError";
import { logger } from "../utils/logger";
import { verifyKey } from "../utils/keyGenerator";


const projectRepository = new ProjectRepository(logger);

export const projectAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const apiKey = authHeader.replace(/^Bearer\s+/i, "").trim();
    
    const projects = await projectRepository.getProjects();
    let matchedKeyEntity = null;

    for (const project of projects) {
      if (project.api_key) {
        const match = await verifyKey(apiKey, project.api_key);
        if (match) {
          matchedKeyEntity = project;
          break;
        }
      }
    }

    if (!matchedKeyEntity) {
      throw new ProjectNotFoundError("Invalid project API key");
    }

    if (!matchedKeyEntity.is_active) {
      throw new ProjectDisabledError();
    }

    // @ts-ignore - Fallback if global augmentation is still not detected
    req.project = {
        id: matchedKeyEntity.id,
        name: matchedKeyEntity.name,
        is_active: matchedKeyEntity.is_active
    };

    next();
  } catch (error) {
    next(error);
  }
};
