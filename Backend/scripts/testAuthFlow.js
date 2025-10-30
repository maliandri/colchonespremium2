/**
 * Script para probar el flujo completo de autenticación
 * Ejecutar: node scripts/testAuthFlow.js
 */

const API_URL = 'http://localhost:3000/api';

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCompleteAuthFlow() {
    console.log('🧪 Probando flujo completo de autenticación...\n');
    console.log('='.repeat(50));

    // Generar email único para evitar conflictos
    const timestamp = Date.now();
    const testUser = {
        email: `vendedor${timestamp}@aluminehogar.com`,
        password: 'vendedor123'
    };

    // PASO 1: REGISTRO
    console.log('\n📝 PASO 1: Registro de usuario');
    console.log('-'.repeat(50));

    try {
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const registerData = await registerResponse.json();

        if (registerResponse.ok) {
            console.log('✅ Usuario registrado exitosamente');
            console.log('   📧 Email:', testUser.email);
            console.log('   🔑 Token:', registerData.token ? registerData.token.substring(0, 30) + '...' : 'No token');
        } else {
            console.log('❌ Error al registrar:', registerData.error || registerData.message);
            return;
        }
    } catch (error) {
        console.error('❌ Error en registro:', error.message);
        return;
    }

    // Esperar un momento
    await wait(1000);

    // PASO 2: LOGIN
    console.log('\n🔐 PASO 2: Login con credenciales');
    console.log('-'.repeat(50));

    try {
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
            console.log('✅ Login exitoso');
            console.log('   📧 Email:', testUser.email);
            console.log('   🔑 Token:', loginData.token ? loginData.token.substring(0, 30) + '...' : 'No token');
            console.log('   👤 Usuario ID:', loginData.userId || 'No ID');

            // Guardar token para uso posterior
            const authToken = loginData.token;

            // PASO 3: PROBAR ENDPOINT PROTEGIDO (si existe)
            console.log('\n🔒 PASO 3: Probando endpoint protegido');
            console.log('-'.repeat(50));

            const protectedResponse = await fetch(`${API_URL}/ventas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                }
            });

            if (protectedResponse.ok) {
                console.log('✅ Acceso autorizado al endpoint protegido');
            } else {
                const errorData = await protectedResponse.json();
                console.log('⚠️  Respuesta del endpoint protegido:', errorData.error || errorData.message);
            }

        } else {
            console.log('❌ Error al hacer login:', loginData.error || loginData.message);
            return;
        }
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        return;
    }

    // PASO 4: INTENTAR LOGIN CON CREDENCIALES INCORRECTAS
    console.log('\n🚫 PASO 4: Intentar login con contraseña incorrecta');
    console.log('-'.repeat(50));

    try {
        const badLoginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testUser.email,
                password: 'wrongpassword'
            })
        });

        const badLoginData = await badLoginResponse.json();

        if (badLoginResponse.ok) {
            console.log('⚠️  WARNING: Login exitoso con contraseña incorrecta (¡problema de seguridad!)');
        } else {
            console.log('✅ Login rechazado correctamente');
            console.log('   ⚠️  Mensaje:', badLoginData.error || badLoginData.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Flujo de autenticación completado\n');
}

testCompleteAuthFlow();
