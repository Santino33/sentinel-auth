import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import axios from 'axios';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function setup() {
    const connectionString = `${process.env.DATABASE_URL}`;
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    console.log('--- Creating a new Admin Key ---');
    const rawAdminKey = crypto.randomBytes(32).toString('hex');
    const hashedAdminKey = await bcrypt.hash(rawAdminKey, 10);

    await prisma.admin_keys.create({
        data: {
            key: hashedAdminKey,
            is_active: true,
            is_bootstrap: false,
            description: "Temporary key for setup"
        }
    });

    console.log(`New Admin Key created: ${rawAdminKey}`);

    console.log('\n--- Creating Project and User for davidnaranjo330@gmail.com ---');
    const BASE_URL = 'http://localhost:3000/api';
    try {
        const projectRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: "David Test Project",
            username: "david_naranjo_" + Date.now(),
            email: "davidnaranjo330@gmail.com",
            password: "SecurePassword123"
        }, {
            headers: { 'x-admin-key': rawAdminKey }
        });

        const { api_key, project, user } = projectRes.data;
        console.log('\n✅ Project setup successful!');
        console.log('-----------------------------------');
        console.log(`Project ID: ${project.id}`);
        console.log(`API Key:    ${api_key}`);
        console.log(`Admin Key:  ${rawAdminKey}`);
        console.log(`User Email: ${user.email}`);
        console.log('-----------------------------------');
        
        console.log('\nUse these credentials in Postman.');
        console.log('1. Forgot Password Request:');
        console.log('   POST ' + BASE_URL + '/auth/password-reset/forgot-password');
        console.log('   Headers: x-api-key: ' + api_key);
        console.log('   Body: { "email": "davidnaranjo330@gmail.com" }');
        console.log('\n2. Reset Password (once you get the code):');
        console.log('   POST ' + BASE_URL + '/auth/password-reset/reset-password');
        console.log('   Headers: x-api-key: ' + api_key);
        console.log('   Body: { "email": "davidnaranjo330@gmail.com", "code": "THE_CODE", "newPassword": "AnotherNewPassword123" }');

    } catch (error: any) {
        console.error('❌ Setup failed:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setup();
