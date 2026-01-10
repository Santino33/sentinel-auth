import { AdminKeyRepository } from "../modules/adminKeys/adminKey.repository";
import { logger } from "./logger";

const adminKeyRepository = new AdminKeyRepository(logger);

export function bootstrap() {
    verifyInitialAdminKey();
}

function verifyInitialAdminKey() {
    const adminKeyCount = adminKeyRepository.getAdminKeysCount();
    if (!adminKeyCount) {
        const adminKey = createInitialAdminKey();
        console.log("========================================\n🚨 INITIAL ADMIN KEY GENERATED\nSAVE THIS KEY — IT WILL NOT BE SHOWN AGAIN\n\nADMIN_KEY=" + adminKey + "\n========================================");
    }
}

function createInitialAdminKey() {
    const adminKey = adminKeyRepository.createAdminKey({ key: "adminKey" });
    logger.info("Bootstrap", "createInitialAdminKey", "Bootstrap completed successfully");
    return adminKey;
}