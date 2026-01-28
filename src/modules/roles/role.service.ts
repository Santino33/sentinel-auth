import { RoleRepository, CreateRoleData, UpdateRoleData } from "./role.repository";
import { assertRoleExists, assertRoleCreated, assertRoleIsNotRepeated, assertRoleName, assertRoleUpdated, assertRoleDeleted } from "./role.guards";

export class RoleService {
    constructor(private roleRepository: RoleRepository) {}

    async createRole(roleData: CreateRoleData) {
        assertRoleName(roleData.name);
        const roleRetrieved = await this.roleRepository.getRoleByName(roleData.name);
        assertRoleIsNotRepeated(roleRetrieved?.name, roleData.name);
        const role = await this.roleRepository.createRole(roleData);
        assertRoleCreated(role);
        return role;
    }

    async getRolesByProjectId(projectId: string) {
        const roles = await this.roleRepository.getRolesByProjectId(projectId);
        return roles;
    }

    async getRoleById(id: string, projectId: string) {
        const roleRetrieved = await this.roleRepository.getRolesByIdAndProjectId(id, projectId);
        assertRoleExists(roleRetrieved);
        return roleRetrieved;
    }

    async updateRole(id: string, roleData: UpdateRoleData, projectId: string) {
        assertRoleName(roleData.name);
        const roleRetrieved = await this.roleRepository.getRolesByIdAndProjectId(id, projectId);
        assertRoleExists(roleRetrieved);
        const role = await this.roleRepository.updateRole(id, roleData);
        assertRoleUpdated(role);
        return role;
    }

    async deleteRole(id: string, projectId: string) {
        const roleRetrieved = await this.roleRepository.getRolesByIdAndProjectId(id, projectId);
        assertRoleExists(roleRetrieved);
        const role = await this.roleRepository.deleteRole(id);
        assertRoleDeleted(role);
        return role;
    }
}