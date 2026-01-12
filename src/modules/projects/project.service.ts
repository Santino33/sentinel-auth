import { ProjectRepository, CreateProjectData, UpdateProjectData } from "./project.repository";
import { AdminKeyRepository } from "../adminKeys/adminKey.repository";
import { generateKey, generateHash } from "../../utils/keyGenerator";
import { 
    assertProjectName, 
    assertProjectExists, 
    assertProjectIsActive, 
    assertProjectIsNotDisabled, 
    assertProjectIsNotActive,
    assertAdminKeyIsActive,
    assertProjectNameIsNotRepeated
} from "./project.guards";

export class ProjectService {
    constructor(private projectRepository: ProjectRepository, private adminKeyRepository: AdminKeyRepository) {}

    async createProject(projectData: CreateProjectData, providedAdminKey: string) {
        const projectRetrieved = await this.projectRepository.getProjectByApiKey(projectData.api_key);
        const adminKey = await this.adminKeyRepository.getAdminKeybyKey(providedAdminKey);

        assertProjectName(projectData);
        assertAdminKeyIsActive(adminKey);
        assertProjectNameIsNotRepeated(projectRetrieved?.name, projectData.name);
        
        const apiKey = await generateKey();
        const hash = await generateHash(apiKey);
        
        const project = {
            name: projectData.name,
            api_key: hash,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        }
        
        return this.projectRepository.createProject(project);
    }

    async getProjects() {
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

    async disableProject(project_id: string) {
        const project = await this.projectRepository.getProjectById(project_id);
        assertProjectExists(project);
        assertProjectIsNotDisabled(project);
        
        return this.projectRepository.disableProject(project_id);
    }

    async enableProject(project_id: string) {
        const project = await this.projectRepository.getProjectById(project_id);
        assertProjectExists(project);
        assertProjectIsNotActive(project);
        
        return this.projectRepository.enableProject(project_id);
    }
}