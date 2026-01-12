import { ProjectRepository, CreateProjectData, UpdateProjectData } from "./project.repository";
import { generateKey, generateHash, verifyKey } from "../../utils/keyGenerator";


export class ProjectService {
    constructor(private projectRepository: ProjectRepository) {}

    async createProject(projectData: CreateProjectData) {
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
        return this.projectRepository.getProjectByApiKey(api_key);
    }

    async updateProject(api_key: string, projectData: UpdateProjectData) {
        const project = {
            name: projectData.name,
            updated_at: new Date(),
        }
        return this.projectRepository.updateProject(api_key, project);
    }

    async disableProject(project_id: string) {
        return this.projectRepository.disableProject(project_id);
    }

    async enableProject(project_id: string) {
        return this.projectRepository.enableProject(project_id);
    }
}