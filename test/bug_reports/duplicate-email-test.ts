import axios from 'axios';

const ADMIN_TOKEN = '3aa479a71ad4305cb89106613e5307c9d868f30c36a12578843bb8836fa5bebb'; // Using the one created before
const BASE_URL = 'http://localhost:3000/api';

async function testDuplicateEmail() {
    console.log('--- Testing Duplicate Email Bug ---');
    try {
        // 1. Create a project and user (email X)
        console.log('Step 1: Creating first project/user...');
        const email = `test_bug_${Date.now()}@example.com`;
        const res1 = await axios.post(`${BASE_URL}/admin/projects`, {
            name: "Project 1",
            username: "user1_" + Date.now(),
            email: email,
            password: "Password123"
        }, {
            headers: { 'x-admin-key': ADMIN_TOKEN }
        });
        const apiKey1 = res1.data.api_key;
        console.log('✅ First user created with email:', email);

        // 2. Attempt to create another project with the same email
        console.log('\nStep 2: Attempting to create second project with SAME email but DIFFERENT username...');
        try {
            await axios.post(`${BASE_URL}/admin/projects`, {
                name: "Project 2",
                username: "user2_" + Date.now(),
                email: email,
                password: "Password123"
            }, {
                headers: { 'x-admin-key': ADMIN_TOKEN }
            });
            console.error('❌ Error: Creating project with duplicate email should have failed!');
        } catch (error: any) {
            console.log('✅ Caught expected error:', error.response?.status, error.response?.data);
            if (error.response?.status === 409) {
                console.log('✨ SUCCESS: Custom 409 error received instead of 500.');
            } else {
                console.error('❌ FAILED: Expected 409 but got', error.response?.status);
            }
        }

        // 3. Attempt to create a user in Project 1 with the same email via /users
        console.log('\nStep 3: Attempting to create a user in Project 1 with the DUPLICATE email via /api/users...');
        try {
            // First login to get a token
            const loginRes = await axios.post(`${BASE_URL}/auth/auth/login`, {
                email: email,
                password: "Password123"
            }, {
                headers: { 'x-api-key': apiKey1 }
            });
            const token = loginRes.data.accessToken;

            await axios.post(`${BASE_URL}/users`, {
                username: "another_user_" + Date.now(),
                email: email,
                password: "Password123",
                role: "USER"
            }, {
                headers: { 
                    'x-api-key': apiKey1,
                    'Authorization': `Bearer ${token}`
                }
            });
            console.error('❌ Error: Creating user with duplicate email should have failed!');
        } catch (error: any) {
            console.log('✅ Caught expected error:', error.response?.status, error.response?.data);
            if (error.response?.status === 409) {
                console.log('✨ SUCCESS: Custom 409 error received.');
            } else {
                console.error('❌ FAILED: Expected 409 but got', error.response?.status);
            }
        }

    } catch (error: any) {
        console.error('❌ Unexpected failure:', error.response?.data || error.message);
    }
}

testDuplicateEmail();
