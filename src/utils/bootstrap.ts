import { AdminKeyRepository } from "../modules/adminKeys/adminKey.repository";
import { generateKey, generateHash } from "./keyGenerator";
import { logger } from "./logger";

const adminKeyRepository = new AdminKeyRepository(logger);

export async function bootstrap() {
    await verifyInitialAdminKey();
}

async function verifyInitialAdminKey() {
    const adminKeyCount = await adminKeyRepository.getAdminKeysCount();    
    if (adminKeyCount === 0) {
        const adminKey = await createInitialAdminKey();
        console.log("========================================\n🚨 INITIAL ADMIN KEY GENERATED\nSAVE THIS KEY — IT WILL NOT BE SHOWN AGAIN\n\nADMIN_KEY=" + adminKey + "\n========================================");
    }
}

async function createInitialAdminKey() {
    const rawKey = await generateKey();
    const hashedKey = await generateHash(rawKey);

    await adminKeyRepository.createAdminKey({
        key: hashedKey,
        is_active: true,
        is_bootstrap: true
    });

    logger.info("Bootstrap", "createInitialAdminKey", "Initial bootstrap admin key created successfully");
    return rawKey;
}