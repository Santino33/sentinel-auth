import { generateKey, generateHash, verifyKey } from "../../utils/keyGenerator";
import { AdminKeyRepository, CreateAdminKeyData } from "./adminKey.repository";
import { assertAdminKeyIsNotActive, assertAdminKeyIsNotDisabled, assertAdminKeyExists, assertAdminKeyIsActive, assertAdminKeyNotAbleToDisable } from "./adminKey.guards";

export class AdminKeyService {
  constructor(private repo: AdminKeyRepository) {}

  async createKey() {
    const adminKey = await generateKey();
    const hash = await generateHash(adminKey);
    const createdKey = await this.repo.createAdminKey({ key: hash, is_active: true });
    return {
      id: createdKey.id,
      key: adminKey
    };
  }

  async disableBootstrapAdminKey() {
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    assertAdminKeyNotAbleToDisable(adminKeysCount);
    const disabledAdminKey = await this.repo.disableBootstrapAdminKey();
    assertAdminKeyExists(disabledAdminKey);
    return disabledAdminKey;
  }

  async disableAdminKey(id: string) {
    
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    assertAdminKeyNotAbleToDisable(adminKeysCount);

    const adminKey = await this.repo.getAdminKeyById(id);
    assertAdminKeyExists(adminKey);
    assertAdminKeyIsNotDisabled(adminKey);

    const disabledAdminKey = await this.repo.updateAdminKey(id, { is_active: false, key: adminKey.key });
    return disabledAdminKey;
  }

  async enableAdminKey(id: string) {
    
    const adminKey = await this.repo.getAdminKeyById(id);
    assertAdminKeyExists(adminKey);
    assertAdminKeyIsNotActive(adminKey);

    const enabledAdminKey = await this.repo.updateAdminKey(id, { is_active: true, key: adminKey.key });
    return enabledAdminKey;
  }

  
}
