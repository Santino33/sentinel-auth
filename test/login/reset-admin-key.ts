import { prisma } from "../../src/lib/prisma";

async function main() {
  // Delete existing bootstrap key
  await prisma.admin_keys.deleteMany({
    where: { is_bootstrap: true }
  });
  console.log("Deleted existing bootstrap key. Restart server to generate new one.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
