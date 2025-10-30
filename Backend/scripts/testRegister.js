/**
 * Script para probar el registro de usuarios
 * Ejecutar: node scripts/testRegister.js
 */

const API_URL = 'http://localhost:3000/api';

async function testRegister() {
    console.log('🧪 Probando registro de usuario...\n');

    const testUser = {
        email: 'test@aluminehogar.com',
        password: 'test1234'
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Usuario registrado exitosamente');
            console.log('📧 Email:', testUser.email);
            console.log('🔑 Token:', data.token ? data.token.substring(0, 20) + '...' : 'No token');
            console.log('\n📊 Respuesta completa:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error al registrar usuario');
            console.log('⚠️  Mensaje:', data.error || data.message);
            console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testRegister();
