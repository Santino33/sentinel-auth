-- 1. Create project_users table
CREATE TABLE "project_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_users_pkey" PRIMARY KEY ("id")
);

-- 2. Migrate data from user_roles
-- We use the project_id from the role to ensure the membership is contextual to the project where the role exists.
INSERT INTO "project_users" ("project_id", "user_id", "role_id")
SELECT r.project_id, ur.user_id, ur.role_id
FROM "user_roles" ur
JOIN "roles" r ON ur.role_id = r.id;

-- 3. Migrate users that have project_id but no role assignment in user_roles
-- We assign the first available role in their current project to preserve their membership.
INSERT INTO "project_users" ("project_id", "user_id", "role_id")
SELECT u.project_id, u.id, (SELECT r.id FROM "roles" r WHERE r.project_id = u.project_id LIMIT 1)
FROM "users" u
WHERE u.project_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM "project_users" pu WHERE pu.user_id = u.id AND pu.project_id = u.project_id);

-- 4. Set up Constraints and Indexes for the new table
CREATE UNIQUE INDEX "uq_project_user" ON "project_users"("project_id", "user_id");

ALTER TABLE "project_users" ADD CONSTRAINT "fk_project_users_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "project_users" ADD CONSTRAINT "fk_project_users_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "project_users" ADD CONSTRAINT "fk_project_users_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- 5. Drop old constraints and relationships
-- First drop the foreign keys in the joining table being removed
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user_roles_role";
ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "fk_user_roles_user";

-- Drop the foreign key from users to projects
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "fk_users_project";

-- Drop the unique constraints and indexes that depend on project_id in users table
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_user_email_per_project";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "uq_user_username_per_project";
DROP INDEX IF EXISTS "idx_users_project_id";

-- 6. Remove columns salt and project_id from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "project_id";
ALTER TABLE "users" DROP COLUMN IF EXISTS "salt";

-- 7. Remove the legacy user_roles table
DROP TABLE IF EXISTS "user_roles";

-- 8. Add new global unique constraints to users
CREATE UNIQUE INDEX "uq_user_username" ON "users"("username");
CREATE UNIQUE INDEX "uq_user_email" ON "users"("email");
