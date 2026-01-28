import axios from 'axios';

const ADMIN_KEY = '11aa9430fe7de606c7a455496ea02c300e2727c0d5e4ba0ac52e4deaaa0964d3';
const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log('--- 1. Creando Proyecto ---');
        const projectRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: "Test Project " + Date.now(),
            username: "admin_test",
            email: "admin@test.com",
            password: "password123"
        }, {
            headers: { 'x-admin-key': ADMIN_KEY }
        });

        const { api_key, project, user } = projectRes.data;
        console.log('Proyecto creado:', project.name);
        console.log('API_KEY:', api_key);

        console.log('\n--- 2. Login para obtener JWT ---');
        // Usamos el endpoint de login de demostración que creamos
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: "admin@test.com",
            password: "password123"
        }, {
            headers: { 'x-api-key': api_key }
        });

        const { accessToken } = loginRes.data;
        console.log('JWT obtenido con éxito');

        console.log('\n--- 3. Creando un NUEVO usuario usando el core refactorizado ---');
        const newUserRes = await axios.post(`${BASE_URL}/users`, {
            username: "new_user_" + Date.now(),
            email: `user_${Date.now()}@test.com`,
            password: "user123",
            role: "admin"
        }, {
            headers: { 
                'x-api-key': api_key,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Resultado de creación de usuario:', JSON.stringify(newUserRes.data, null, 2));
        console.log('\n✅ PRUEBA EXITOSA');

    } catch (error: any) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

runTest();
