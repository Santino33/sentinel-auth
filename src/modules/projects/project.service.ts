import { ProjectRepository, CreateProjectData, UpdateProjectData } from "./project.repository";
import { AdminKeyRepository } from "../adminKeys/adminKey.repository";
import { AdminKeyNotFoundError } from "../../errors/AdminKeyError";
import { generateKey, generateHash } from "../../utils/keyGenerator";
import { 
    assertProjectName, 
    assertProjectExists, 
    assertProjectIsActive, 
    assertProjectIsNotDisabled, 
    assertProjectIsNotActive,
    assertAdminKeyIsActive,
    assertAdminKeyExists,
    assertProjectNameIsNotRepeated
} from "./project.guards";

export class ProjectService {
    constructor(private projectRepository: ProjectRepository, private adminKeyRepository: AdminKeyRepository) {}

    async createProject(projectName: string, providedAdminKey: string) {
        const isValid = await this.adminKeyRepository.validateKey(providedAdminKey);
        if (!isValid) throw new AdminKeyNotFoundError();

        const projectRetrieved = await this.projectRepository.getProjectByApiKey(projectName);
        assertProjectName(projectName);
        assertProjectNameIsNotRepeated(projectRetrieved?.name, projectName);
        
        const apiKey = await generateKey();
        const hash = await generateHash(apiKey);
        
        const project = {
            name: projectName,
            api_key: hash,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        }
        
        return this.projectRepository.createProject(project);
    }

    async getProjects(providedAdminKey: string) {
        const isValid = await this.adminKeyRepository.validateKey(providedAdminKey);
        if (!isValid) throw new AdminKeyNotFoundError();

        return this.projectRepository.getProjects();
    }

    async getProjectByApiKey(api_key: string) {
        const project = await this.projectRepository.getProjectByApiKey(api_key);
        assertProjectExists(project);
        
        return project;
    }

    async updateProject(api_key: string, projectData: UpdateProjectData) {
        const project = await this.projectRepository.getProjectByApiKey(api_key);
        assertProjectExists(project);
        assertProjectIsActive(project);
        
        const updateData = {
            name: projectData.name,
            updated_at: new Date(),
        }
        
        return this.projectRepository.updateProject(api_key, updateData);
    }

    async disableProject(api_key: string, providedAdminKey: string) {
        const isValid = await this.adminKeyRepository.validateKey(providedAdminKey);
        if (!isValid) throw new AdminKeyNotFoundError();

        const project = await this.projectRepository.getProjectByApiKey(api_key);
        assertProjectExists(project);
        assertProjectIsNotDisabled(project);
        
        return this.projectRepository.disableProject(api_key);
    }

    async enableProject(api_key: string, providedAdminKey: string) {
        const isValid = await this.adminKeyRepository.validateKey(providedAdminKey);
        if (!isValid) throw new AdminKeyNotFoundError();

        const project = await this.projectRepository.getProjectByApiKey(api_key);
        assertProjectExists(project);
        assertProjectIsNotActive(project);
        
        return this.projectRepository.enableProject(api_key);
    }
}