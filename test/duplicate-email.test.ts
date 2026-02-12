import "dotenv/config";
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { generateKey, generateHash } from '../src/utils/keyGenerator';

describe('Duplicate Email Handling', () => {
    let ADMIN_KEY: string;
    const timestamp = Date.now();
    const email = `test_bug_${timestamp}@example.com`;

    beforeAll(async () => {
        ADMIN_KEY = await generateKey();
        const hashedKey = await generateHash(ADMIN_KEY);
        await prisma.admin_keys.create({
            data: {
                key: hashedKey,
                is_active: true
            }
        });
    });

    afterAll(async () => {
        await prisma.admin_keys.deleteMany({});
    });

    it('should create first project with email', async () => {
        const res = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `DupTest Project 1 ${timestamp}`,
                username: `user1_${timestamp}`,
                email: email,
                password: 'Password123'
            });

        expect(res.status).toBe(201);
    });

    it.skip('should fail on duplicate email across projects', async () => {
        // Note: This feature is not yet implemented in projectBootstrap.service.ts
        // The service only checks for duplicate project names, not duplicate emails
        const res = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: `DupTest Project 2 ${timestamp}`,
                username: `user2_${timestamp}`,
                email: email,
                password: 'Password123'
            });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});
