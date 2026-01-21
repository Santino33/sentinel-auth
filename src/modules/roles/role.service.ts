import { RoleRepository, CreateRoleData, UpdateRoleData } from "./role.repository";
import { assertRoleExists, assertRoleCreated, assertRoleIsNotRepeated, assertRoleName, assertRoleUpdated } from "./role.guards";

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

    async getRoles() {
        const roles = await this.roleRepository.getRoles();
        return roles;
    }

    async getRoleById(id: string) {
        const role = await this.roleRepository.getRoleById(id);
        assertRoleExists(role);
        return role;
    }

    async updateRole(id: string, roleData: UpdateRoleData) {
        assertRoleName(roleData.name);
        const roleRetrieved = await this.roleRepository.getRoleById(id);
        assertRoleExists(roleRetrieved);
        const role = await this.roleRepository.updateRole(id, roleData);
        assertRoleUpdated(role);
        return role;
    }
}