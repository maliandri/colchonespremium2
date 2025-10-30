/**
 * Script para probar el login de usuarios
 * Ejecutar: node scripts/testLogin.js
 */

const API_URL = 'http://localhost:3000/api';

async function testLogin() {
    console.log('🧪 Probando login de usuario...\n');

    const credentials = {
        email: 'test@aluminehogar.com',
        password: 'test1234'
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login exitoso');
            console.log('📧 Email:', credentials.email);
            console.log('🔑 Token:', data.token ? data.token.substring(0, 20) + '...' : 'No token');
            console.log('👤 Usuario ID:', data.userId || data.user?._id || 'No ID');
            console.log('\n📊 Respuesta completa:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error al hacer login');
            console.log('⚠️  Mensaje:', data.error || data.message);
            console.log('📊 Respuesta:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testLogin();
