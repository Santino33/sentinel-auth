import { prisma } from "../../src/lib/prisma";
import { generateKey, generateHash } from "../../src/utils/keyGenerator";

async function main() {
  const rawKey = await generateKey();
  const hashedKey = await generateHash(rawKey);

  const adminKey = await prisma.admin_keys.create({
    data: {
      key: hashedKey,
      is_active: true,
      is_bootstrap: true
    }
  });

  console.log("New Bootstrap Admin Key (USE THIS):", rawKey);
  console.log("DB Record:", adminKey);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
