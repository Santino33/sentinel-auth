// test-db.ts
// Script to demonstrate basic CRUD operations using repository classes.

import { prisma } from "../src/lib/prisma";
import { logger } from "../src/utils/logger";
import { UserRepository } from "../src/repositories/user.repository";
import { RoleRepository } from "../src/repositories/role.repository";
import { ProjectRepository } from "../src/repositories/project.repository";
import { AdminKeyRepository } from "../src/repositories/adminKey.repository";

function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function main() {
  const projectRepo = new ProjectRepository();
  const userRepo = new UserRepository();
  const roleRepo = new RoleRepository();
  const adminKeyRepo = new AdminKeyRepository(logger);

  // --- Create sample data ---
  log("Creating project...");
  const randomSuffix = Math.floor(Math.random() * 10000);
  const project = await projectRepo.createProject({
    name: `Test Project ${randomSuffix}`,
    api_key: `api-key-${randomSuffix}`,
    is_active: true,
  });
  log(`Created project: ${JSON.stringify(project)}`);

  log("Creating sample data linked to project...");
  const user = await userRepo.createUser({
    project_id: project.id,
    username: `testuser_${randomSuffix}`,
    email: `test_${randomSuffix}@example.com`,
    password_hash: "hashedpw",
    salt: "randomsalt",
    is_active: true,
  });
  log(`Created user: ${JSON.stringify(user)}`);

  const role = await roleRepo.createRole({
    project_id: project.id,
    name: "admin",
  });
  log(`Created role: ${JSON.stringify(role)}`);

  const adminKey = await adminKeyRepo.createAdminKey({
    key: `secret-key-${randomSuffix}`,
    is_active: true,
  });
  log(`Created admin key: ${JSON.stringify(adminKey)}`);

  // --- Read data back ---
  log("\nReading back data...");
  const users = await userRepo.getUsers();
  log(`All users: ${JSON.stringify(users)}`);

  const roles = await roleRepo.getRoles();
  log(`All roles: ${JSON.stringify(roles)}`);

  const adminKeys = await adminKeyRepo.getAdminKeys();
  log(`All admin keys: ${JSON.stringify(adminKeys)}`);

  // --- Update example (optional) ---
  log("\nUpdating user is_active flag to false...");
  const updatedUser = await userRepo.updateUser(user.id, {
    project_id: user.project_id,
    username: user.username,
    email: user.email ?? undefined,
    password_hash: user.password_hash,
    salt: user.salt,
    is_active: false,
  });
  log(`Updated user: ${JSON.stringify(updatedUser)}`);

  // --- Delete created records ---
  log("\nCleaning up: deleting created records...");
  await adminKeyRepo.deleteAdminKey(adminKey.id);
  await roleRepo.deleteRole(role.id);
  await userRepo.deleteUser(user.id);
  // Important: Delete project last because of foreign key constraints
  await projectRepo.deleteProject(project.id);
  log("Cleanup complete.");
}

main()
  .catch((e) => {
    console.error("Error during script execution:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
