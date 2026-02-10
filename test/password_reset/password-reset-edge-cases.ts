import "dotenv/config";
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ADMIN_KEY = '11aa9430fe7de606c7a455496ea02c300e2727c0d5e4ba0ac52e4deaaa0964d3';
const BASE_URL = 'http://localhost:3000/api';
const RESET_URL = `${BASE_URL}/auth/password-reset`;

async function runTests() {
    console.log('🚀 INICIANDO PRUEBAS DE PASSWORD RESET (EDGE CASES)\n');
    const timestamp = Date.now();
    const email = `test_reset_${timestamp}@example.com`;
    const password = "OriginalPassword123";
    const newPassword = "NewSecurePassword123";
    let apiKey = '';

    try {
        // --- SETUP: Proyecto y Usuario ---
        console.log('--- Setup: Creando Proyecto y Usuario ---');
        const setupRes = await axios.post(`${BASE_URL}/admin/projects`, {
            name: `Test Reset Project ${timestamp}`,
            username: `user_reset_${timestamp}`,
            email: email,
            password: password
        }, { headers: { 'x-admin-key': ADMIN_KEY } });

        apiKey = setupRes.data.api_key;
        const userId = setupRes.data.user.id;
        console.log('Setup completado.');

        // --- 1. HAPPY PATH ---
        console.log('\n--- 1. Pruebas Happy Path ---');
        
        console.log('Solicitando código de reset...');
        await axios.post(`${RESET_URL}/forgot-password`, { email }, { headers: { 'x-api-key': apiKey } });

        console.log('Obteniendo código de la base de datos...');
        const resetCodeEntry = await prisma.password_reset_codes.findFirst({
            where: { user_id: userId, used: false },
            orderBy: { created_at: 'desc' }
        });

        if (!resetCodeEntry) throw new Error('No se encontró el código en la DB');
        const code = resetCodeEntry.code;
        console.log('Código obtenido:', code);

        console.log('Ejecutando reset de password...');
        await axios.post(`${RESET_URL}/reset-password`, {
            email,
            code,
            newPassword
        }, { headers: { 'x-api-key': apiKey } });
        console.log('✅ Reset exitoso');

        console.log('Verificando login con nueva password...');
        await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password: newPassword
        }, { headers: { 'x-api-key': apiKey } });
        console.log('✅ Login exitoso con nueva password');

        // --- 2. EDGE CASES ---
        console.log('\n--- 2. Edge Cases: Validaciones ---');

        // 2.1 Formato de Email Inválido
        console.log('Caso 2.1: Email con formato inválido...');
        try {
            await axios.post(`${RESET_URL}/forgot-password`, { 
                email: 'invalid-email' 
            }, { headers: { 'x-api-key': apiKey } });
            console.log('❌ FALLÓ: Permitió email inválido');
        } catch (error: any) {
            console.log('✅ OK: Rechazó email inválido correctamente');
        }

        // 2.2 Usuario No Existente (No debe filtrar información)
        console.log('Caso 2.2: Email no registrado...');
        const resNonExistent = await axios.post(`${RESET_URL}/forgot-password`, { 
            email: 'nonexistent@example.com' 
        }, { headers: { 'x-api-key': apiKey } });
        if (resNonExistent.status === 200) {
            console.log('✅ OK: Respondió 200 (sin confirmar existencia del usuario)');
        }

        // 2.3 Formato de Código Inválido
        console.log('Caso 2.3: Formato de código inválido (ej. "abc")...');
        try {
            await axios.post(`${RESET_URL}/reset-password`, {
                email,
                code: 'abc',
                newPassword: 'SomePassword123'
            }, { headers: { 'x-api-key': apiKey } });
            console.log('❌ FALLÓ: Permitió código no numérico');
        } catch (error: any) {
            console.log('✅ OK: Rechazó código no numérico correctamente');
        }

        // 2.4 Reutilización de Código
        console.log('Caso 2.4: Reutilización de código consumido...');
        try {
            await axios.post(`${RESET_URL}/reset-password`, {
                email,
                code, // Usado en el happy path
                newPassword: 'AnotherPassword123'
            }, { headers: { 'x-api-key': apiKey } });
            console.log('❌ FALLÓ: Permitió reutilizar el código');
        } catch (error: any) {
            console.log('✅ OK: Rechazó reutilización correctamente');
        }

        // 2.5 Password Débil
        console.log('Caso 2.5: Password demasiado débil...');
        try {
            // Generar nuevo código para esta prueba
            await axios.post(`${RESET_URL}/forgot-password`, { email }, { headers: { 'x-api-key': apiKey } });
            const newResetCodeEntry = await prisma.password_reset_codes.findFirst({
                where: { user_id: userId, used: false },
                orderBy: { created_at: 'desc' }
            });
            const newCode = newResetCodeEntry?.code;

            await axios.post(`${RESET_URL}/reset-password`, {
                email,
                code: newCode,
                newPassword: '123'
            }, { headers: { 'x-api-key': apiKey } });
            console.log('❌ FALLÓ: Permitió password débil');
        } catch (error: any) {
            console.log('✅ OK: Rechazó password débil correctamente');
        }

        // 2.6 Código Expirado
        console.log('Caso 2.6: Código expirado...');
        await axios.post(`${RESET_URL}/forgot-password`, { email }, { headers: { 'x-api-key': apiKey } });
        const expiredCodeEntry = await prisma.password_reset_codes.findFirst({
            where: { user_id: userId, used: false },
            orderBy: { created_at: 'desc' }
        });
        
        if (expiredCodeEntry) {
            // Forzar expiración en DB
            await prisma.password_reset_codes.update({
                where: { id: expiredCodeEntry.id },
                data: { expires_at: new Date(Date.now() - 3600000) } // 1 hora atrás
            });

            try {
                await axios.post(`${BASE_URL}/reset-password`, {
                    email,
                    code: expiredCodeEntry.code,
                    newPassword: 'PasswordExp123'
                }, { headers: { 'x-api-key': apiKey } });
                console.log('❌ FALLÓ: Permitió código expirado');
            } catch (error: any) {
                console.log('✅ OK: Rechazó código expirado correctamente');
            }
        }

        console.log('\n✨ TODAS LAS PRUEBAS DE PASSWORD RESET COMPLETADAS\n');

    } catch (error: any) {
        console.error('❌ Error general en la prueba:', error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
