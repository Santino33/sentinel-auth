import { ProjectRepository, CreateProjectData } from "./project.repository";
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
        }
        return this.projectRepository.createProject(project);
    }

    async getProjects() {
        return this.projectRepository.getProjects();
    }

    async getProjectByApiKey(api_key: string) {
        return this.projectRepository.getProjectByApiKey(api_key);
    }

    async updateProject(id: string, projectData: CreateProjectData) {
        return this.projectRepository.updateProject(id, projectData);
    }

    async deleteProject(id: string) {
        return this.projectRepository.deleteProject(id);
    }
}