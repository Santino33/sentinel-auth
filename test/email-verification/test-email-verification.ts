import axios from 'axios';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/sentinel?schema=public';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface TestProject {
    api_key: string;
    project: {
        id: string;
        name: string;
    };
    user: {
        id: string;
        username: string;
        email: string;
    };
}

async function verifyAdminUser(adminEmail: string): Promise<boolean> {
    try {
        const adminUser = await prisma.users.findFirst({
            where: { email: adminEmail }
        });
        
        if (!adminUser) {
            console.log('   Admin user not found yet');
            return false;
        }
        
        if (adminUser.email_verified) {
            console.log('✅ Admin already verified');
            return true;
        }
        
        if (adminUser.verification_code) {
            console.log('   Admin verification code:', adminUser.verification_code);
            console.log('   Verifying admin email...');
            try {
                await axios.post(`${BASE_URL}/auth/email-verification/verify-email`, {
                    email: adminEmail,
                    code: adminUser.verification_code
                });
                console.log('✅ Admin email verified');
                return true;
            } catch (verifyError: any) {
                console.log('   Verification failed:', verifyError.response?.data || verifyError.message);
                return false;
            }
        }
        
        console.log('   Admin has no verification code');
        return false;
    } catch (error: any) {
        console.log('   Could not verify admin:', error.message);
        return false;
    }
}

async function runTest() {
    const ADMIN_KEY = process.env.ADMIN_KEY;
    
    if (!ADMIN_KEY) {
        console.error('❌ ERROR: ADMIN_KEY environment variable is not set');
        console.error('');
        console.error('To run tests:');
        console.error('  1. Start the container: docker-compose up -d --build sentinel-back');
        console.error('  2. Get the admin key: docker logs sentinel-back | grep "ADMIN_KEY="');
        console.error('  3. Run tests: ADMIN_KEY=xxx npx ts-node test/email-verification/test-email-verification.ts');
        console.error('');
        console.error('Example:');
        console.error('  ADMIN_KEY=05e586bbd4532c8d75097ae4c764d5fb757587689f3b77a022db9215eef113ab npx ts-node test/email-verification/test-email-verification.ts');
        process.exit(1);
    }
    
    try {
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║     EMAIL VERIFICATION FEATURE - COMPREHENSIVE TEST SUITE    ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 1: USER REGISTRATION FLOW                             ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 1.1: User Registration Creates User with email_verified = false ---');
        const timestamp1 = Date.now();
        const testUser1 = {
            username: `testuser_db_${timestamp1}`,
            email: `test_db_${timestamp1}@test.com`,
            password: 'Password123!'
        };
        
        console.log('   Creating test project...');
        const project1Res = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `DB Test Project ${timestamp1}`,
            username: `admin_db_${timestamp1}`,
            email: `admin_db_${timestamp1}@test.com`,
            password: 'Password123!'
        }, {
            headers: { 'x-admin-key': ADMIN_KEY }
        });
        const project1: TestProject = project1Res.data;
        console.log('✅ Project created:', project1.project.name);
        
        console.log('\n--- Test 1.2: Verify Admin and Register User ---');
        
        await verifyAdminUser(`admin_db_${timestamp1}@test.com`);
        
        const adminLogin1 = await axios.post(`${BASE_URL}/auth/login`, {
            email: `admin_db_${timestamp1}@test.com`,
            password: 'Password123!'
        }, {
            headers: { 'x-api-key': project1.api_key }
        });
        const adminToken1 = adminLogin1.data.accessToken;
        
        await axios.post(`${BASE_URL}/users`, {
            username: testUser1.username,
            email: testUser1.email,
            password: testUser1.password,
            role: 'ADMIN'
        }, {
            headers: {
                'x-api-key': project1.api_key,
                'Authorization': `Bearer ${adminToken1}`
            }
        });
        console.log('✅ User registered successfully:', testUser1.username);
        
        console.log('\n--- Test 1.3: Verify User Has Verification Code in Database ---');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const dbUser1 = await prisma.users.findFirst({
            where: { email: testUser1.email }
        });
        
        if (dbUser1) {
            console.log('   User in database:');
            console.log('   - email_verified:', dbUser1.email_verified);
            console.log('   - verification_code:', dbUser1.verification_code);
            console.log('   - verification_expires_at:', dbUser1.verification_expires_at);
            
            if (dbUser1.email_verified === false) {
                console.log('✅ User correctly created with email_verified = false');
            } else {
                console.log('❌ FAILED: User should have email_verified = false');
                process.exit(1);
            }
            
            if (dbUser1.verification_code && dbUser1.verification_code.length === 8) {
                console.log('✅ Verification code is 8 digits:', dbUser1.verification_code);
            } else {
                console.log('❌ FAILED: Verification code should be 8 digits');
                process.exit(1);
            }
            
            if (dbUser1.verification_expires_at) {
                const expiryHours = (dbUser1.verification_expires_at.getTime() - dbUser1.created_at.getTime()) / (1000 * 60 * 60);
                console.log(`✅ Verification code expiry is ~${expiryHours.toFixed(1)} hours`);
            }
        } else {
            console.log('❌ FAILED: User not found in database');
            process.exit(1);
        }
        
        console.log('\n--- Test 1.4: Login Blocked Due to Unverified Email ---');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: testUser1.email,
                password: testUser1.password
            }, {
                headers: { 'x-api-key': project1.api_key }
            });
            console.log('❌ FAILED: Should have blocked login for unverified email');
            process.exit(1);
        } catch (error: any) {
            if (error.response?.data?.errorCode === 'USER_EMAIL_NOT_VERIFIED') {
                console.log('✅ Login correctly blocked - email not verified');
            } else {
                throw error;
            }
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 2: EMAIL VERIFICATION REQUEST ENDPOINT                ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 2.1: Request Verification for Unregistered Email ---');
        const unregisteredEmail = `nonexistent_db_${Date.now()}@notexists.com`;
        const reqVerifyUnregistered = await axios.post(`${BASE_URL}/auth/email-verification/request-verification`, {
            email: unregisteredEmail
        });
        console.log('✅ Returns success for unregistered email:', reqVerifyUnregistered.data.message);
        
        console.log('\n--- Test 2.2: Request Verification for Verified Email ---');
        await axios.post(`${BASE_URL}/auth/email-verification/request-verification`, {
            email: `admin_db_${timestamp1}@test.com`
        });
        console.log('✅ Returns success for already verified email');
        
        console.log('\n--- Test 2.3: Request Verification Generates New Code ---');
        await axios.post(`${BASE_URL}/auth/email-verification/request-verification`, {
            email: testUser1.email
        });
        console.log('✅ Verification code sent for unverified user');
        
        console.log('\n--- Test 2.4: Multiple Requests Generate New Codes ---');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userBeforeUpdate = await prisma.users.findFirst({
            where: { email: testUser1.email }
        });
        const codeBefore = userBeforeUpdate?.verification_code;
        
        await axios.post(`${BASE_URL}/auth/email-verification/request-verification`, {
            email: testUser1.email
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userAfterUpdate = await prisma.users.findFirst({
            where: { email: testUser1.email }
        });
        const codeAfter = userAfterUpdate?.verification_code;
        
        if (codeBefore !== codeAfter) {
            console.log('✅ New verification code generated on each request');
        } else {
            console.log('❌ FAILED: Code should have been updated');
            process.exit(1);
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 3: EMAIL VERIFICATION WITH DATABASE CODE              ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 3.1: Verify with Valid Code ---');
        const validCode = userAfterUpdate?.verification_code;
        if (!validCode) {
            console.log('❌ FAILED: No verification code found');
            process.exit(1);
        }
        
        const verifyRes = await axios.post(`${BASE_URL}/auth/email-verification/verify-email`, {
            email: testUser1.email,
            code: validCode
        });
        
        if (verifyRes.data.message === 'Email verified successfully') {
            console.log('✅ Email verified successfully');
        } else {
            console.log('❌ FAILED: Verification failed');
            process.exit(1);
        }
        
        console.log('\n--- Test 3.2: Verify User email_verified = true in Database ---');
        await new Promise(resolve => setTimeout(resolve, 500));
        const verifiedUser = await prisma.users.findFirst({
            where: { email: testUser1.email }
        });
        
        if (verifiedUser?.email_verified === true) {
            console.log('✅ User email_verified = true in database');
        } else {
            console.log('❌ FAILED: User should have email_verified = true');
            process.exit(1);
        }
        
        console.log('\n--- Test 3.3: Verify Code Fields Cleared ---');
        if (!verifiedUser?.verification_code && !verifiedUser?.verification_expires_at) {
            console.log('✅ Verification code and expiry cleared');
        } else {
            console.log('❌ FAILED: Code fields should be cleared');
            process.exit(1);
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 4: LOGIN AFTER VERIFICATION                          ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 4.1: Login Succeeds After Verification ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: testUser1.email,
            password: testUser1.password
        }, {
            headers: { 'x-api-key': project1.api_key }
        });
        
        if (loginRes.data.accessToken && loginRes.data.refreshToken) {
            console.log('✅ Login successful after verification');
            console.log('   Access token received:', loginRes.data.accessToken.substring(0, 20) + '...');
        } else {
            console.log('❌ FAILED: Login should succeed');
            process.exit(1);
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 5: ERROR HANDLING                                    ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 5.1: Invalid Code Returns Error ---');
        try {
            await axios.post(`${BASE_URL}/auth/email-verification/verify-email`, {
                email: testUser1.email,
                code: '00000000'
            });
            console.log('❌ FAILED: Should have rejected invalid code');
            process.exit(1);
        } catch (error: any) {
            if (error.response?.data?.errorCode === 'VERIFICATION_CODE_INVALID') {
                console.log('✅ Invalid code correctly rejected');
            } else {
                throw error;
            }
        }
        
        console.log('\n--- Test 5.2: Login with Unverified Email Still Blocked ---');
        const timestampNew = Date.now();
        const newUserRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `New User Test ${timestampNew}`,
            username: `admin_new_${timestampNew}`,
            email: `admin_new_${timestampNew}@test.com`,
            password: 'Password123!'
        }, {
            headers: { 'x-admin-key': ADMIN_KEY }
        });
        
        await verifyAdminUser(`admin_new_${timestampNew}@test.com`);
        
        const adminLoginNew = await axios.post(`${BASE_URL}/auth/login`, {
            email: `admin_new_${timestampNew}@test.com`,
            password: 'Password123!'
        }, {
            headers: { 'x-api-key': newUserRes.data.api_key }
        });
        
        const newUserEmail = `pending_${timestampNew}@test.com`;
        await axios.post(`${BASE_URL}/users`, {
            username: `pending_user_${timestampNew}`,
            email: newUserEmail,
            password: 'Password123!',
            role: 'ADMIN'
        }, {
            headers: {
                'x-api-key': newUserRes.data.api_key,
                'Authorization': `Bearer ${adminLoginNew.data.accessToken}`
            }
        });
        
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: newUserEmail,
                password: 'Password123!'
            }, {
                headers: { 'x-api-key': newUserRes.data.api_key }
            });
            console.log('❌ FAILED: Should have blocked login');
            process.exit(1);
        } catch (error: any) {
            if (error.response?.data?.errorCode === 'USER_EMAIL_NOT_VERIFIED') {
                console.log('✅ Login correctly blocked for unverified user');
            } else {
                throw error;
            }
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║  SUITE 6: TIMING ATTACK PREVENTION                          ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        
        console.log('\n--- Test 6.1: Password Validated Before Email Check ---');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: newUserEmail,
                password: 'WrongPassword123!'
            }, {
                headers: { 'x-api-key': newUserRes.data.api_key }
            });
            console.log('❌ FAILED: Should have rejected wrong password');
            process.exit(1);
        } catch (error: any) {
            if (error.response?.data?.errorCode === 'AUTH_INVALID_CREDENTIALS') {
                console.log('✅ Password validated before email verification check');
            } else {
                throw error;
            }
        }
        
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                   TEST SUMMARY                                 ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('\n✅ ALL DATABASE INTEGRATION TESTS PASSED!');
        console.log('\nTest Results:');
        console.log('  ✓ Suite 1: User Registration Flow (4/4 tests)');
        console.log('  ✓ Suite 2: Email Verification Request (4/4 tests)');
        console.log('  ✓ Suite 3: Email Verification with Valid Code (3/3 tests)');
        console.log('  ✓ Suite 4: Login After Verification (1/1 tests)');
        console.log('  ✓ Suite 5: Error Handling (2/2 tests)');
        console.log('  ✓ Suite 6: Timing Attack Prevention (1/1 tests)');
        
    } catch (error: any) {
        console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        await prisma.$disconnect();
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
