import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Auth Flow', () => {
    let ADMIN_KEY: string;
    let apiKey: string;
    let accessToken: string;
    const timestamp = Date.now();
    const adminEmail = `admin_${timestamp}@test.com`;

    beforeAll(async () => {
        ADMIN_KEY = await generateKey();
        const hashedKey = await generateHash(ADMIN_KEY);
        await prisma.admin_keys.create({
            data: {
                key: hashedKey,
                is_active: true
            }
        });

        const projectRes = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `Test Project ${timestamp}`,
                username: `admin_${timestamp}`,
                email: adminEmail,
                password: 'password123'
            });

        expect(projectRes.status).toBe(201);
        apiKey = projectRes.body.api_key;

        // Verify admin email
        const dbUser = await prisma.users.findFirst({ where: { email: adminEmail } });
        if (dbUser?.verification_code) {
            await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({ email: adminEmail, code: dbUser.verification_code });
        }
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
        await prisma.projects.deleteMany({
            where: { name: { contains: 'Test Project' } }
        });
    });

    describe('Admin Login', () => {
        it('should login admin successfully', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .set('x-api-key', apiKey)
                .send({
                    email: adminEmail,
                    password: 'password123'
                });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body).toHaveProperty('accessToken');
            expect(loginRes.body).toHaveProperty('refreshToken');
            accessToken = loginRes.body.accessToken;
        });
    });

    describe('User Creation', () => {
        it('should create a new user', async () => {
            const newUserRes = await request(app)
                .post('/api/users')
                .set('x-api-key', apiKey)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    username: `user_${timestamp}`,
                    email: `user_${timestamp}@test.com`,
                    password: 'user_password_456',
                    role: 'ADMIN'
                });

            expect(newUserRes.status).toBe(201);
            expect(newUserRes.body).toHaveProperty('id');
        });
    });

    describe('User Login', () => {
        it('should login the new user', async () => {
            // Verify user email first
            const userEmail = `user_${timestamp}@test.com`;
            const dbUser = await prisma.users.findFirst({ where: { email: userEmail } });
            if (dbUser?.verification_code) {
                await request(app)
                    .post('/api/auth/email-verification/verify-email')
                    .send({ email: userEmail, code: dbUser.verification_code });
            }

            const userLoginRes = await request(app)
                .post('/api/auth/login')
                .set('x-api-key', apiKey)
                .send({
                    email: `user_${timestamp}@test.com`,
                    password: 'user_password_456'
                });

            expect(userLoginRes.status).toBe(200);
            expect(userLoginRes.body).toHaveProperty('accessToken');
        });

        it('should verify user identity with /me', async () => {
            // Verify user email first
            const userEmail = `user_${timestamp}@test.com`;
            const dbUser = await prisma.users.findFirst({ where: { email: userEmail } });
            if (dbUser?.verification_code) {
                await request(app)
                    .post('/api/auth/email-verification/verify-email')
                    .send({ email: userEmail, code: dbUser.verification_code });
            }

            const userLoginRes = await request(app)
                .post('/api/auth/login')
                .set('x-api-key', apiKey)
                .send({
                    email: `user_${timestamp}@test.com`,
                    password: 'user_password_456'
                });

            const meRes = await request(app)
                .get('/api/auth/me')
                .set('x-api-key', apiKey)
                .set('Authorization', `Bearer ${userLoginRes.body.accessToken}`);

            expect(meRes.status).toBe(200);
            expect(meRes.body.user.email).toBe(`user_${timestamp}@test.com`);
        });
    });
});
