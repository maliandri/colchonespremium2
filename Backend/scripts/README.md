# Scripts de Testing y Utilidades

Este directorio contiene scripts útiles para testing, migración de datos y configuración.

## Scripts de Autenticación

### 1. `testRegister.js` - Probar Registro de Usuario

Prueba el endpoint de registro de usuarios.

```bash
node scripts/testRegister.js
```

**Qué hace:**
- Registra un usuario de prueba con email `test@aluminehogar.com`
- Muestra el token generado
- Útil para verificar que el sistema de registro funciona

### 2. `testLogin.js` - Probar Login de Usuario

Prueba el endpoint de login.

```bash
node scripts/testLogin.js
```

**Qué hace:**
- Intenta hacer login con el usuario de prueba
- Muestra el token JWT generado
- Verifica que las credenciales sean válidas

**Nota:** Debes ejecutar `testRegister.js` primero para crear el usuario.

### 3. `testAuthFlow.js` - Probar Flujo Completo de Autenticación

Prueba el flujo completo de autenticación (registro, login, acceso a endpoints protegidos).

```bash
node scripts/testAuthFlow.js
```

**Qué hace:**
- Crea un usuario con email único
- Hace login con ese usuario
- Prueba acceso a endpoints protegidos con el token
- Verifica que credenciales incorrectas sean rechazadas

**Ideal para:**
- Verificar que todo el sistema de autenticación funciona
- Testing después de cambios en el backend
- Demostración del sistema de seguridad

## Script de Configuración de Cloudinary

### `cloudinaryConfig.js`

Configuración y utilidades para trabajar con Cloudinary.

**Funciones disponibles:**
- `getCloudinaryUrl(publicId, transformations)` - Genera URLs optimizadas
- `subirImagen(file, categoria, productId)` - Sube imágenes a Cloudinary
- `eliminarImagen(publicId)` - Elimina imágenes
- `migrarImagenesACloudinary(productos)` - Migra imágenes desde URLs externas

**Presets de transformación:**
- `IMG_THUMB` - 150x150px, para miniaturas
- `IMG_CARD` - 400x300px, para tarjetas de producto
- `IMG_DETAIL` - 1200x900px, para vista detallada
- `IMG_MOBILE` - 800x600px, para dispositivos móviles

## Uso en el Proyecto

### Desarrollo
Durante el desarrollo, usa estos scripts para probar cambios en el sistema de autenticación sin necesidad de usar el frontend.

### Testing Manual
Ejecuta `testAuthFlow.js` para verificar rápidamente que todos los endpoints de autenticación funcionan correctamente.

### Debugging
Si hay problemas con login/registro, estos scripts ayudan a identificar si el problema está en el backend o frontend.

## Requisitos

- Node.js instalado
- Backend corriendo en `http://localhost:3000`
- Base de datos MongoDB conectada

## Notas

- Los scripts usan `fetch` API (disponible en Node.js 18+)
- Los tokens generados son JWT válidos que puedes usar en Postman o similar
- El script `testAuthFlow.js` genera usuarios con emails únicos para evitar conflictos
