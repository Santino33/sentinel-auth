import axios from 'axios';

const ADMIN_KEY = '11aa9430fe7de606c7a455496ea02c300e2727c0d5e4ba0ac52e4deaaa0964d3';
const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        const timestamp = Date.now();
        console.log('--- 1. Creando Proyecto de Prueba ---');
        const projectRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Project ${timestamp}`,
            username: `admin_${timestamp}`,
            email: `admin_${timestamp}@test.com`,
            password: "password123"
        }, {
            headers: { 'x-admin-key': ADMIN_KEY }
        });

        const { api_key, project } = projectRes.data;
        console.log('Proyecto creado:', project.name);

        console.log('\n--- 2. Lote 1: Login del Admin para crear un usuario ---');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: `admin_${timestamp}@test.com`,
            password: "password123"
        }, {
            headers: { 'x-api-key': api_key }
        });
        const adminToken = adminLogin.data.accessToken;

        console.log('\n--- 3. Creando el NUEVO usuario subordinado ---');
        const newUserBody = {
            username: `user_${timestamp}`,
            email: `user_${timestamp}@test.com`,
            password: "user_password_456",
            role: "ADMIN" // Usamos ADMIN para simplificar ya que es el único rol disponible por defecto
        };

        const newUserRes = await axios.post(`${BASE_URL}/users`, newUserBody, {
            headers: { 
                'x-api-key': api_key,
                'Authorization': `Bearer ${adminToken}`
            }
        });
        console.log('Usuario creado:', newUserRes.data.username);

        console.log('\n--- 4. Intentando LOGIN con el NUEVO USUARIO ---');
        const userLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: newUserBody.email,
            password: newUserBody.password
        }, {
            headers: { 'x-api-key': api_key }
        });

        console.log('Login exitoso del nuevo usuario!');
        console.log('Token recibido:', userLoginRes.data.accessToken.substring(0, 20) + '...');

        console.log('\n--- 5. Verificando identidad con el token del nuevo usuario ---');
        const meRes = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 
                'x-api-key': api_key,
                'Authorization': `Bearer ${userLoginRes.data.accessToken}`
            }
        });

        console.log('Email verificado en /me:', meRes.data.user.email);
        
        console.log('\n✅ PRUEBA DE CREACIÓN Y LOGIN COMPLETADA CON ÉXITO');

    } catch (error: any) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

runTest();
