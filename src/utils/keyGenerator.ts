import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const generateKey = async () => {
    return crypto.randomBytes(32).toString("hex");
}

export const generateHash = async (key: string) => {
    return await bcrypt.hash(key, 12);
}

export const verifyKey = async (recievedKey: string, storedHash: string) => {
    return await bcrypt.compare(recievedKey, storedHash);
}

