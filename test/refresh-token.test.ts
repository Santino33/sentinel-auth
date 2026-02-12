import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Refresh Token', () => {
    let ADMIN_KEY: string;
    let apiKey: string;
    let userRefreshToken: string;
    const timestamp = Date.now();
    const email = `refresh_${timestamp}@example.com`;
    const password = 'Password123';

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
                name: `Refresh Project ${timestamp}`,
                username: `admin_${timestamp}`,
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
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    it('should return access and refresh tokens on login', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('accessToken');
        expect(loginRes.body).toHaveProperty('refreshToken');
        userRefreshToken = loginRes.body.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .set('x-api-key', apiKey)
            .send({ refreshToken: userRefreshToken });

        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body).toHaveProperty('accessToken');
        expect(refreshRes.body).toHaveProperty('refreshToken');
        userRefreshToken = refreshRes.body.refreshToken;
    });

    it('should verify identity with new access token', async () => {
        const refreshRes = await request(app)
            .post('/api/auth/refresh')
            .set('x-api-key', apiKey)
            .send({ refreshToken: userRefreshToken });

        const meRes = await request(app)
            .get('/api/auth/me')
            .set('x-api-key', apiKey)
            .set('Authorization', `Bearer ${refreshRes.body.accessToken}`);

        expect(meRes.status).toBe(200);
        expect(meRes.body.user.email).toBe(email);
    });

    it('should invalidate old refresh token after refresh (rotation)', async () => {
        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email, password });
        
        const oldToken = loginRes.body.refreshToken;

        await request(app)
            .post('/api/auth/refresh')
            .set('x-api-key', apiKey)
            .send({ refreshToken: oldToken });

        const refreshAgainRes = await request(app)
            .post('/api/auth/refresh')
            .set('x-api-key', apiKey)
            .send({ refreshToken: oldToken });

        expect(refreshAgainRes.status).toBe(401);
    });
});
