import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export class UserRoleRepository {
    private getClient(tx?: Prisma.TransactionClient) {
        return tx || prisma;
    }

    async assignRoleToUser(projectId: string, userId: string, roleId: string, tx?: Prisma.TransactionClient) {
        // Since user_roles table was migrated to project_users, we use project_users
        return (this.getClient(tx) as any).project_users.upsert({
            where: {
                project_id_user_id: {
                    project_id: projectId,
                    user_id: userId
                }
            },
            create: {
                project_id: projectId,
                user_id: userId,
                role_id: roleId,
                is_active: true
            },
            update: {
                role_id: roleId
            }
        });
    }

    async getUserRoleInProject(projectId: string, userId: string, tx?: Prisma.TransactionClient) {
        return (this.getClient(tx) as any).project_users.findUnique({
            where: {
                project_id_user_id: {
                    project_id: projectId,
                    user_id: userId
                }
            },
            include: {
                roles: true
            }
        });
    }
}
