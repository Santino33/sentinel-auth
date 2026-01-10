import { generateKey, generateHash, verifyKey } from "../utils/keyGenerator";
import { AdminKeyRepository, CreateAdminKeyData } from "../repositories/adminKey.repository";

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
        throw new Error("Admin key not found");
    }
    return adminKey;
  }

  async verifyKey(key: string, hash: string) {
    return await verifyKey(key, hash);
  }
}
