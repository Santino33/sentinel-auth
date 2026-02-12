import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Change Password', () => {
    let ADMIN_KEY: string;
    let apiKey: string;
    let accessToken: string;
    const timestamp = Date.now();
    const email = `cp_${timestamp}@test.com`;
    const password = 'Password123!';
    const newPassword = 'NewPassword456!';

    beforeAll(async () => {
        ADMIN_KEY = await generateKey();
        const hashedKey = await generateHash(ADMIN_KEY);
        await prisma.admin_keys.create({
            data: {
                key: hashedKey,
                is_active: true
            }
        });

        const setupRes = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `CP Project ${timestamp}`,
                username: `admin_cp_${timestamp}`,
                email: email,
                password: password
            });

        apiKey = setupRes.body.api_key;

        const dbUser = await prisma.users.findFirst({ where: { email } });
        if (dbUser?.verification_code) {
            await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({ email, code: dbUser.verification_code });
        }

        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password });

        accessToken = loginRes.body.accessToken;
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    it('should change password successfully', async () => {
        const changeRes = await request(app)
            .post('/api/auth/change-password')
            .set('x-api-key', apiKey)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                currentPassword: password,
                newPassword: newPassword
            });

        expect(changeRes.status).toBe(200);
        expect(changeRes.body.message).toBe('Password changed successfully');
    });

    it('should login with new password', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password: newPassword });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('accessToken');
    });

    it('should reject wrong current password', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password: newPassword });

        const changeRes = await request(app)
            .post('/api/auth/change-password')
            .set('x-api-key', apiKey)
            .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
            .send({
                currentPassword: 'WrongPassword123!',
                newPassword: 'AnyPassword123!'
            });

        expect(changeRes.status).toBe(401);
        expect(changeRes.body.errorCode).toBe('AUTH_WRONG_PASSWORD');
    });

    it('should reject same new password as current', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password: newPassword });

        const changeRes = await request(app)
            .post('/api/auth/change-password')
            .set('x-api-key', apiKey)
            .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
            .send({
                currentPassword: newPassword,
                newPassword: newPassword
            });

        expect(changeRes.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
        const changeRes = await request(app)
            .post('/api/auth/change-password')
            .set('x-api-key', apiKey)
            .send({
                currentPassword: newPassword,
                newPassword: 'AnyPassword123!'
            });

        expect(changeRes.status).toBe(401);
    });
});
