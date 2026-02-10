import axios from 'axios';

const ADMIN_KEY = 'c228119cce0fe5a5737616104e0ae70b8b7fe37c5c4bed1748e1b83c533b34b5';
const BASE_URL = process.env.TEST_BASE_URL || 'http://sentinel-back:3000/api';

async function runTest() {
    try {
        const timestamp = Date.now();
        console.log('--- 1. Creating Test Project ---');
        const projectRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Project ${timestamp}`,
            username: `admin_${timestamp}`,
            email: `admin_${timestamp}@test.com`,
            password: "Password123!"
        }, {
            headers: { 'x-admin-key': ADMIN_KEY }
        });

        const { api_key, project } = projectRes.data;
        console.log('Project created:', project.name);

        console.log('\n--- 2. Logging in as Admin ---');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: `admin_${timestamp}@test.com`,
            password: "Password123!"
        }, {
            headers: { 'x-api-key': api_key }
        });
        const adminToken = adminLogin.data.accessToken;
        const oldRefreshToken = adminLogin.data.refreshToken;
        console.log('Admin login successful');

        console.log('\n--- 3. Test Case: Change Password Successfully ---');
        const newPassword = "NewPassword456!";
        const changePasswordRes = await axios.post(`${BASE_URL}/auth/change-password`, {
            currentPassword: "Password123!",
            newPassword: newPassword
        }, {
            headers: {
                'x-api-key': api_key,
                'Authorization': `Bearer ${adminToken}`
            }
        });
        console.log('✅ Password changed successfully:', changePasswordRes.data.message);

        console.log('\n--- 4. Verify Old Refresh Token Invalidated ---');
        try {
            await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken: oldRefreshToken
            }, {
                headers: { 'x-api-key': api_key }
            });
            console.log('❌ Should have failed with revoked refresh token');
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Old refresh token correctly invalidated');
            } else {
                throw error;
            }
        }

        console.log('\n--- 5. Verify Login with New Password ---');
        const loginWithNewPassword = await axios.post(`${BASE_URL}/auth/login`, {
            email: `admin_${timestamp}@test.com`,
            password: newPassword
        }, {
            headers: { 'x-api-key': api_key }
        });
        console.log('✅ Login with new password successful');

        console.log('\n--- 6. Test Case: Wrong Current Password ---');
        try {
            await axios.post(`${BASE_URL}/auth/change-password`, {
                currentPassword: "WrongPassword123!",
                newPassword: "AnotherPassword789!"
            }, {
                headers: {
                    'x-api-key': api_key,
                    'Authorization': `Bearer ${loginWithNewPassword.data.accessToken}`
                }
            });
            console.log('❌ Should have failed with wrong current password');
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly rejected wrong current password');
            } else {
                throw error;
            }
        }

        console.log('\n--- 7. Test Case: New Password Same as Current ---');
        try {
            await axios.post(`${BASE_URL}/auth/change-password`, {
                currentPassword: newPassword,
                newPassword: newPassword
            }, {
                headers: {
                    'x-api-key': api_key,
                    'Authorization': `Bearer ${loginWithNewPassword.data.accessToken}`
                }
            });
            console.log('❌ Should have failed when new password equals current');
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log('✅ Correctly rejected same password');
            } else {
                throw error;
            }
        }

        console.log('\n--- 8. Test Case: Weak New Password ---');
        try {
            await axios.post(`${BASE_URL}/auth/change-password`, {
                currentPassword: newPassword,
                newPassword: "weak"
            }, {
                headers: {
                    'x-api-key': api_key,
                    'Authorization': `Bearer ${loginWithNewPassword.data.accessToken}`
                }
            });
            console.log('❌ Should have failed with weak password');
        } catch (error: any) {
            if (error.response?.status === 400) {
                console.log('✅ Correctly rejected weak password');
            } else {
                throw error;
            }
        }

        console.log('\n--- 9. Test Case: Unauthenticated Request ---');
        try {
            await axios.post(`${BASE_URL}/auth/change-password`, {
                currentPassword: "any",
                newPassword: "any"
            }, {
                headers: { 'x-api-key': api_key }
            });
            console.log('❌ Should have failed without authentication');
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('✅ Correctly rejected unauthenticated request');
            } else {
                throw error;
            }
        }

        console.log('\n✅ ALL CHANGE PASSWORD TESTS PASSED');

    } catch (error: any) {
        console.error('❌ Error in test:', error.response?.data || error.message);
        process.exit(1);
    }
}

runTest();
