import { ProjectRepository, CreateProjectData, UpdateProjectData } from "./project.repository";
import { generateKey, generateHash } from "../../utils/keyGenerator";
import { 
    assertProjectName, 
    assertProjectExists, 
    assertProjectIsActive, 
    assertProjectIsNotDisabled, 
    assertProjectIsNotActive,
    assertProjectNameIsNotRepeated
} from "./project.guards";

export class ProjectService {
    constructor(private projectRepository: ProjectRepository) {}

    async createProject(projectName: string) {
        const projectRetrieved = await this.projectRepository.getProjectByName(projectName);
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

    async getProjects() {
        return this.projectRepository.getProjects();
    }

    async getProjectById(id: string) {
        const project = await this.projectRepository.getProjectById(id);
        assertProjectExists(project);
        
        return project;
    }

    async updateProject(id: string, projectData: UpdateProjectData) {
        const project = await this.projectRepository.getProjectById(id);
        assertProjectExists(project);
        assertProjectIsActive(project);
        
        const updateData = {
            name: projectData.name,
            updated_at: new Date(),
        }
        
        return this.projectRepository.updateProject(id, updateData);
    }

    async disableProject(id: string) {
        const project = await this.projectRepository.getProjectById(id);
        assertProjectExists(project);
        assertProjectIsNotDisabled(project);
        
        return this.projectRepository.disableProject(id);
    }

    async enableProject(id: string) {
        const project = await this.projectRepository.getProjectById(id);
        assertProjectExists(project);
        assertProjectIsNotActive(project);
        
        return this.projectRepository.enableProject(id);
    }
}