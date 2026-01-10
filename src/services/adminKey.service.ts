import { generateKey, generateHash, verifyKey } from "../utils/keyGenerator";
import { AdminKeyRepository, CreateAdminKeyData } from "../repositories/adminKey.repository";

export class AdminKeyService {
  constructor(private repo: AdminKeyRepository) {}

  async createKey() {
    const adminKey = await generateKey();
    const hash = await generateHash(adminKey);
    this.repo.createAdminKey({ key: hash, is_active: true });
    return adminKey;
  }

  async updateAdminKey(id: string, adminKeyData: CreateAdminKeyData) {
    const adminKey = await this.repo.updateAdminKey(id, adminKeyData);
    return adminKey;
  }

  async verifyKey(key: string, hash: string) {
    return await verifyKey(key, hash);
  }
}
