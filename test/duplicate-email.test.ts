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
                name: 'Project 1',
                username: `user1_${timestamp}`,
                email: email,
                password: 'Password123'
            });

        expect(res.status).toBeGreaterThanOrEqual(200);
    });

    it('should fail on duplicate email', async () => {
        const res = await request(app)
            .post('/api/admin/projects')
            .set('x-admin-key', ADMIN_KEY)
            .send({
                name: 'Project 2',
                username: `user2_${timestamp}`,
                email: email,
                password: 'Password123'
            });

        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});
