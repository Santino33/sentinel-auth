import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Email Verification', () => {
    let ADMIN_KEY: string;
    let apiKey: string;
    let adminAccessToken: string;
    const timestamp = Date.now();
    const testEmail = `test_ev_${timestamp}@test.com`;

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
                name: `EV Test Project ${timestamp}`,
                username: `admin_ev_${timestamp}`,
                email: `admin_ev_${timestamp}@test.com`,
                password: 'Password123!'
            });

        apiKey = projectRes.body.api_key;

        const dbUser = await prisma.users.findFirst({ 
            where: { email: `admin_ev_${timestamp}@test.com` } 
        });
        if (dbUser?.verification_code) {
            await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({ email: `admin_ev_${timestamp}@test.com`, code: dbUser.verification_code });
        }

        const loginRes = await request(app)
            .post('/api/auth/login')
            .set('x-api-key', apiKey)
            .send({ email: `admin_ev_${timestamp}@test.com`, password: 'Password123!' });

        adminAccessToken = loginRes.body.accessToken;
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    describe('Email Verification Request', () => {
        it('should return success for unregistered email', async () => {
            const res = await request(app)
                .post('/api/auth/email-verification/request-verification')
                .send({ email: 'nonexistent@test.com' });

            expect(res.status).toBe(200);
        });

        it('should return success for verified email', async () => {
            const res = await request(app)
                .post('/api/auth/email-verification/request-verification')
                .send({ email: `admin_ev_${timestamp}@test.com` });

            expect(res.status).toBe(200);
        });

        it('should return success when requesting verification for new email', async () => {
            const res = await request(app)
                .post('/api/auth/email-verification/request-verification')
                .send({ email: testEmail });

            expect(res.status).toBe(200);
        });
    });

    describe('Email Verification with Code', () => {
        it('should create user and get verification code from database', async () => {
            await request(app)
                .post('/api/users')
                .set('x-api-key', apiKey)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({
                    username: `testuser_${timestamp}`,
                    email: testEmail,
                    password: 'Password123!',
                    role: 'ADMIN'
                });

            await request(app)
                .post('/api/auth/email-verification/request-verification')
                .send({ email: testEmail });

            const dbUser = await prisma.users.findFirst({
                where: { email: testEmail }
            });

            expect(dbUser).not.toBeNull();
            expect(dbUser!.verification_code).toBeDefined();
        });

        it('should verify email with valid code', async () => {
            const dbUser = await prisma.users.findFirst({
                where: { email: testEmail }
            });

            const verifyRes = await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({
                    email: testEmail,
                    code: dbUser!.verification_code!
                });

            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.message).toBe('Email verified successfully');
        });

        it('should have email_verified = true in database after verification', async () => {
            const dbUser = await prisma.users.findFirst({
                where: { email: testEmail }
            });

            expect(dbUser!.email_verified).toBe(true);
            expect(dbUser!.verification_code).toBeNull();
            expect(dbUser!.verification_expires_at).toBeNull();
        });

        it('should login successfully after verification', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .set('x-api-key', apiKey)
                .send({ email: testEmail, password: 'Password123!' });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body).toHaveProperty('accessToken');
        });
    });

    describe('Error Handling', () => {
        it('should reject invalid verification code', async () => {
            const verifyRes = await request(app)
                .post('/api/auth/email-verification/verify-email')
                .send({
                    email: testEmail,
                    code: '00000000'
                });

            expect(verifyRes.status).toBe(400);
            expect(verifyRes.body.errorCode).toBe('VERIFICATION_CODE_INVALID');
        });
    });
});
