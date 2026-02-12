import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Login Edge Cases', () => {
    let ADMIN_KEY: string;
    let apiKey1: string;
    let apiKey2: string;
    const timestamp = Date.now();
    const credentials = {
        email: `edge_${timestamp}@test.com`,
        password: "securePassword123"
    };

    beforeAll(async () => {
        ADMIN_KEY = await generateKey();
        const hashedKey = await generateHash(ADMIN_KEY);
        await prisma.admin_keys.create({
            data: {
                key: hashedKey,
                is_active: true
            }
        });

        const p1 = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `Project P1 ${timestamp}`,
                username: `user_p1_${timestamp}`,
                email: credentials.email,
                password: credentials.password
            });

        if (p1.status !== 201) {
            throw new Error(`Setup Project 1 Failed: ${JSON.stringify(p1.body)}`);
        }
        apiKey1 = p1.body.api_key;

        const p2 = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `Project P2 ${timestamp}`,
                username: `admin_p2_${timestamp}`,
                email: `admin_p2_${timestamp}@test.com`,
                password: "password123"
            });

        if (p2.status !== 201) {
            throw new Error(`Setup Project 2 Failed: ${JSON.stringify(p2.body)}`);
        }
        apiKey2 = p2.body.api_key;

        const dbUser = await prisma.users.findFirst({ where: { email: credentials.email } });
        if (dbUser?.verification_code) {
            await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({ email: credentials.email, code: dbUser.verification_code });
        }
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    it('should fail with 401 on incorrect password', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey1)
            .send({
                email: credentials.email,
                password: "wrongPassword"
            });

        expect(response.status).toBe(401);
        expect(response.body.errorCode).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('should fail with 401 on nonexistent email', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey1)
            .send({
                email: "nonexistent@test.com",
                password: credentials.password
            });

        expect(response.status).toBe(401);
        expect(response.body.errorCode).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('should fail with 401 when x-api-key header is missing', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send(credentials);

        expect(response.status).toBe(401);
        expect(response.body.errorCode).toBe('UNAUTHORIZED');
    });

    it('should fail with 404 on invalid x-api-key', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', 'invalid_key')
            .send(credentials);

        expect(response.status).toBe(404);
        expect(response.body.errorCode).toBe('PROJECT_NOT_FOUND');
    });

    it('should fail with 401 when logging in to Project B with user from Project A', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey2)
            .send(credentials);

        expect(response.status).toBe(401);
        expect(response.body.errorCode).toBe('AUTH_USER_NOT_IN_PROJECT');
    });

    it('should fail with 401 on incomplete body (missing email)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey1)
            .send({
                password: credentials.password
            });

        expect(response.status).toBe(401);
        expect(response.body.errorCode).toBe('AUTH_INVALID_CREDENTIALS');
    });
});
