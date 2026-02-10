import { prisma } from "../../src/lib/prisma";

async function main() {
  const adminKey = await prisma.admin_keys.findFirst({
    where: { is_bootstrap: true }
  });
  console.log("Bootstrap Admin Key:", adminKey);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
