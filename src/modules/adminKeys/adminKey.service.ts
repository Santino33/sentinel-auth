import { generateKey, generateHash, verifyKey } from "../../utils/keyGenerator";
import { AdminKeyRepository, CreateAdminKeyData } from "./adminKey.repository";
import { AdminKeyNotFoundError, AdminKeyRequiredError } from "../../errors/AdminKeyError";

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

  async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
    const adminKey = await this.repo.updateAdminKey(id, adminKeyData);
    return adminKey;
  }

  async getAdminKeyByValue(key: string) {
    const adminKey = await this.repo.getAdminKey(key);
    if (!adminKey) {
        throw new AdminKeyNotFoundError();
    }
    return adminKey;
  }

  async disableBootstrapAdminKey() {
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    if (adminKeysCount < 2) {
        throw new AdminKeyRequiredError("Cannot disable bootstrap admin key. At least one active admin key is required, create a new admin key first");
    }
    const adminKey = await this.repo.disableBootstrapAdminKey();
    return adminKey;
  }

  async disableAdminKey(id: string) {
    const adminKeysCount = await this.repo.getActiveAdminKeysCount();
    if (adminKeysCount < 2) {
        throw new AdminKeyRequiredError("Cannot disable admin key. At least one active admin key is required, create a new admin key first");
    }
    const adminKey = await this.repo.getAdminKeyById(id);
    if (!adminKey) {
        throw new AdminKeyNotFoundError();
    }
    await this.repo.updateAdminKey(id, { is_active: false, key: adminKey.key });
    return adminKey;
  }

  async enableAdminKey(id: string) {
    const adminKey = await this.repo.getAdminKeyById(id);
    if (!adminKey) {
        throw new AdminKeyNotFoundError();
    }
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
