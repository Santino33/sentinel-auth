import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Password Reset', () => {
    let ADMIN_KEY: string;
    let apiKey: string;
    let userId: string;
    const timestamp = Date.now();
    const email = `test_reset_${timestamp}@example.com`;
    const originalPassword = 'OriginalPassword123';
    const newPassword = 'NewSecurePassword123';

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
                name: `Reset Project ${timestamp}`,
                username: `user_reset_${timestamp}`,
                email: email,
                password: originalPassword
            });

        apiKey = setupRes.body.api_key;
        userId = setupRes.body.user.id;

        const dbUser = await prisma.users.findFirst({ where: { email } });
        if (dbUser?.verification_code) {
            await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({ email, code: dbUser.verification_code });
        }
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    describe('Happy Path', () => {
        it('should request password reset code', async () => {
            const res = await request(app)
                .post('/api/auth/password-reset/forgot-password')
                .set('x-api-key', apiKey)
                .send({ email });

            expect(res.status).toBe(200);
        });

        it('should get reset code from database', async () => {
            const resetCode = await prisma.password_reset_codes.findFirst({
                where: { user_id: userId, used: false },
                orderBy: { created_at: 'desc' }
            });

            expect(resetCode).not.toBeNull();
            expect(resetCode!.code).toHaveLength(8);
        });

        it('should reset password with valid code', async () => {
            const resetCode = await prisma.password_reset_codes.findFirst({
                where: { user_id: userId, used: false },
                orderBy: { created_at: 'desc' }
            });

            const res = await request(app)
                .post('/api/auth/password-reset/reset-password')
                .set('x-api-key', apiKey)
                .send({
                    email,
                    code: resetCode!.code,
                    newPassword
                });

            expect(res.status).toBe(200);
        });

        it('should login with new password', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .set('x-api-key', apiKey)
                .send({ email, password: newPassword });

            expect(loginRes.status).toBe(200);
        });
    });

    describe('Edge Cases', () => {
        it('should return 200 for non-existent email (security)', async () => {
            const res = await request(app)
                .post('/api/auth/password-reset/forgot-password')
                .set('x-api-key', apiKey)
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(200);
        });

        it('should reject weak password', async () => {
            await request(app)
                .post('/api/auth/password-reset/forgot-password')
                .set('x-api-key', apiKey)
                .send({ email });

            const newResetCode = await prisma.password_reset_codes.findFirst({
                where: { user_id: userId, used: false },
                orderBy: { created_at: 'desc' }
            });

            const res = await request(app)
                .post('/api/auth/password-reset/reset-password')
                .set('x-api-key', apiKey)
                .send({
                    email,
                    code: newResetCode!.code,
                    newPassword: '123'
                });

            expect(res.status).toBe(400);
        });
    });
});
