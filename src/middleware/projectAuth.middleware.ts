import { Request, Response, NextFunction } from "express";
import { ProjectRepository } from "../modules/projects/project.repository";
import { UnauthorizedError } from "../errors/HttpError";
import { ProjectDisabledError, ProjectNotFoundError } from "../errors/ProjectError";
import { logger } from "../utils/logger";

const projectRepository = new ProjectRepository(logger);

export const projectAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const apiKey = authHeader.split(" ")[1];

    const project = await projectRepository.getProjectByApiKey(apiKey);

    if (!project) {
      throw new ProjectNotFoundError("Invalid project API key");
    }

    if (!project.is_active) {
      throw new ProjectDisabledError();
    }

    req.project = {
        id: project.id,
        name: project.name,
        is_active: project.is_active
    };

    next();
  } catch (error) {
    next(error);
  }
};
