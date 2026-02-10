import axios from 'axios';

const ADMIN_KEY = '11aa9430fe7de606c7a455496ea02c300e2727c0d5e4ba0ac52e4deaaa0964d3';
const BASE_URL = 'http://localhost:3000/api';

async function runEdgeCases() {
    console.log('🚀 INICIANDO PRUEBAS DE EDGE CASES PARA LOGIN\n');
    let apiKey1: string;
    let apiKey2: string;
    const timestamp = Date.now();
    const credentials = {
        email: `edge_${timestamp}@test.com`,
        password: "securePassword123"
    };

    try {
        // SETUP: Crear dos proyectos y un usuario en el Proyecto 1
        console.log('--- SETUP: Preparando datos de prueba ---');
        const p1 = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Project P1 ${timestamp}`,
            username: `user_p1_${timestamp}`,
            email: credentials.email,
            password: credentials.password
        }, { headers: { 'x-admin-key': ADMIN_KEY } });
        apiKey1 = p1.data.api_key;

        const p2 = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Project P2 ${timestamp}`,
            username: `admin_p2_${timestamp}`,
            email: `admin_p2_${timestamp}@test.com`,
            password: "password123"
        }, { headers: { 'x-admin-key': ADMIN_KEY } });
        apiKey2 = p2.data.api_key;
        console.log('Setup completado.\n');

        // CASE 1: Password Incorrecto
        await testCase('Login con password incorrecto', async () => {
            return axios.post(`${BASE_URL}/auth/login`, {
                email: credentials.email,
                password: "wrongPassword"
            }, { headers: { 'x-api-key': apiKey1 } });
        }, 401, 'AUTH_INVALID_CREDENTIALS');

        // CASE 2: Usuario Inexistente
        await testCase('Login con email inexistente', async () => {
            return axios.post(`${BASE_URL}/auth/login`, {
                email: "nonexistent@test.com",
                password: credentials.password
            }, { headers: { 'x-api-key': apiKey1 } });
        }, 401, 'AUTH_INVALID_CREDENTIALS');

        // CASE 3: Sin X-API-KEY
        await testCase('Login sin header x-api-key', async () => {
            return axios.post(`${BASE_URL}/auth/login`, credentials, {});
        }, 401, 'UNAUTHORIZED'); // Fallo en projectAuth middleware

        // CASE 4: X-API-KEY Inválida
        await testCase('Login con x-api-key inválida', async () => {
            return axios.post(`${BASE_URL}/auth/login`, credentials, {
                headers: { 'x-api-key': 'invalid_key' }
            });
        }, 404, 'PROJECT_NOT_FOUND');

        // CASE 5: Usuario fuera del proyecto (Cross-project login attempt)
        await testCase('Login en Proyecto B con usuario del Proyecto A', async () => {
            return axios.post(`${BASE_URL}/auth/login`, credentials, {
                headers: { 'x-api-key': apiKey2 }
            });
        }, 401, 'AUTH_USER_NOT_IN_PROJECT');

        // CASE 6: Body incompleto
        await testCase('Login con body incompleto (sin email)', async () => {
            return axios.post(`${BASE_URL}/auth/login`, {
                password: credentials.password
            }, { headers: { 'x-api-key': apiKey1 } });
        }, 401, 'AUTH_INVALID_CREDENTIALS');

        console.log('\n✨ TODAS LAS PRUEBAS DE EDGE CASES FINALIZADAS');

    } catch (error: any) {
        console.error('❌ Error fatal en el runner de pruebas:', error.message);
    }
}

async function testCase(name: string, action: () => Promise<any>, expectedStatus: number, expectedErrorCode?: string) {
    try {
        process.stdout.write(`Prueba: ${name} ... `);
        await action();
        console.log('❌ FALLÓ (Se esperaba un error y la petición fue exitosa)');
    } catch (error: any) {
        const status = error.response?.status;
        const errorCode = error.response?.data?.errorCode;

        if (status === expectedStatus && (!expectedErrorCode || errorCode === expectedErrorCode)) {
            console.log('✅ OK');
        } else {
            console.log(`❌ FALLÓ (Status: ${status}, ErrorCode: ${errorCode} | Esperado: ${expectedStatus}, ${expectedErrorCode})`);
        }
    }
}

runEdgeCases();
