import axios from 'axios';

const ADMIN_KEY = '11aa9430fe7de606c7a455496ea02c300e2727c0d5e4ba0ac52e4deaaa0964d3';
const BASE_URL = 'http://localhost:3000/api';

async function runRefreshTest() {
    console.log('🚀 INICIANDO PRUEBA DE REFRESH TOKEN\n');
    const timestamp = Date.now();
    const email = `refresh_${timestamp}@example.com`;
    const password = "Password123";

    try {
        // 1. SETUP: Crear proyecto y usuario
        console.log('--- 1. Setup: Creando Proyecto ---');
        const setupRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Refresh Project ${timestamp}`,
            username: `admin_${timestamp}`,
            email: email,
            password: password
        }, { headers: { 'x-admin-key': ADMIN_KEY } });

        const apiKey = setupRes.data.api_key;

        // 2. LOGIN: Obtener primer par de tokens
        console.log('--- 2. Login inicial ---');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email, password
        }, { headers: { 'x-api-key': apiKey } });

        const { accessToken, refreshToken } = loginRes.data;
        console.log('Login exitoso.');
        console.log('Refresh Token recibido:', refreshToken.substring(0, 10) + '...');

        // 3. REFRESH: Intercambiar refresh token por un nuevo par
        console.log('\n--- 3. Ejecutando Refresh ---');
        const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
        }, { headers: { 'x-api-key': apiKey } });

        const newTokens = refreshRes.data;
        console.log('Refresh exitoso.');
        console.log('Nuevo Access Token recibido.');

        // 4. VERIFICACIÓN: Probar el nuevo access token
        console.log('\n--- 4. Verificando identidad con el NUEVO Access Token ---');
        const meRes = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { 
                'x-api-key': apiKey,
                'Authorization': `Bearer ${newTokens.accessToken}`
            }
        });
        console.log('Auth OK. Usuario:', meRes.data.user.email);

        // 5. SEGURIDAD: Intentar usar el Refresh Token VIEJO (Debería fallar por la rotación)
        console.log('\n--- 5. Prueba de Seguridad: Intentando usar el Refresh Token viejo ---');
        try {
            await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken // El viejo
            }, { headers: { 'x-api-key': apiKey } });
            console.log('❌ FALLÓ: El token viejo no fue invalidado.');
        } catch (error: any) {
            console.log('✅ OK: El token viejo fue rechazado correctamente (Rotation working)');
        }

        console.log('\n✨ PRUEBA DE REFRESH TOKEN FINALIZADA CON ÉXITO');

    } catch (error: any) {
        console.error('❌ Error en la prueba:', error.response?.data || error.message);
    }
}

runRefreshTest();
