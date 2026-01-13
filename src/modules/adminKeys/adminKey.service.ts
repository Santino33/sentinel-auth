import { generateKey, generateHash, verifyKey } from "../../utils/keyGenerator";
import { AdminKeyRepository, CreateAdminKeyData } from "./adminKey.repository";
import { assertAdminKeyAlreadyActive, assertAdminKeyAlreadyDisabled, assertAdminKeyExists, assertAdminKeyIsActive, assertAdminKeyNotAbleToDisable } from "./adminKey.guards";

export class AdminKeyService {
  constructor(private repo: AdminKeyRepository) {}

  async createKey(providedAdminKey: string) {
    const adminKey = await generateKey();
    const hash = await generateHash(adminKey);
    const createdKey = await this.repo.createAdminKey({ key: hash, is_active: true });
    return {
      id: createdKey.id,
      key: adminKey
    };
  }

  async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData, providedAdminKey: string) {
    const adminKey = await this.repo.updateAdminKey(id, adminKeyData);
    assertAdminKeyExists(adminKey);
    return adminKey;
  }

  async getAdminKeyByValue(key: string, providedAdminKey: string) {
    const adminKey = await this.repo.getAdminKey(key);
    assertAdminKeyExists(adminKey);
    return adminKey;
  }

  async disableBootstrapAdminKey(providedAdminKey: string) {
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    assertAdminKeyNotAbleToDisable(adminKeysCount);
    const adminKey = await this.repo.disableBootstrapAdminKey();
    assertAdminKeyExists(adminKey);
    return adminKey;
  }

  async disableAdminKey(id: string, providedAdminKey: string) {
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    assertAdminKeyNotAbleToDisable(adminKeysCount);

    const adminKey = await this.repo.getAdminKeyById(id);
    assertAdminKeyExists(adminKey);
    assertAdminKeyAlreadyDisabled(adminKey);

    await this.repo.updateAdminKey(id, { is_active: false, key: adminKey.key });
    return adminKey;
  }

  async enableAdminKey(id: string, providedAdminKey: string) {
    const adminKey = await this.repo.getAdminKeyById(id);
    assertAdminKeyExists(adminKey);
    assertAdminKeyAlreadyActive(adminKey);

    await this.repo.updateAdminKey(id, { is_active: true, key: adminKey.key });
    return adminKey;
  }

  async validateKey(providedKey: string): Promise<boolean> {
    if (!providedKey) return false;
    const activeKeys = await this.repo.getAdminKeys();
    for (const adminKey of activeKeys) {
        if (adminKey.is_active && adminKey.key) {
            const match = await verifyKey(providedKey, adminKey.key);
            if (match) return true;
        }
    }
    return false;
  }

  async verifyKey(key: string, hash: string) {
    return await verifyKey(key, hash);
  }
}
