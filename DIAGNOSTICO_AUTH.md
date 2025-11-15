# Diagnóstico: Sistema de Autenticación

## Estado Actual

### ✅ Configuración Correcta Encontrada

El sistema de autenticación está **correctamente configurado** usando **Vercel Serverless Functions** conectadas a **MongoDB Atlas**.

---

## Arquitectura del Sistema

### 🏗️ Stack Tecnológico

- **Frontend:** React + Vite (desplegado en Netlify)
- **Backend:** Vercel Serverless Functions (carpeta `/api`)
- **Base de Datos:** MongoDB Atlas (Cloud)
- **Autenticación:** JWT + bcryptjs
- **Email:** Nodemailer (SMTP Zoho)

### 📁 Estructura Serverless

```
api/
├── auth/
│   ├── login.js          → POST /api/auth/login
│   └── register.js       → POST /api/auth/register
├── _lib/
│   ├── db.js            → Conexión a MongoDB (con cache)
│   ├── auth.js          → Generación y verificación JWT
│   ├── models/
│   │   ├── User.js      → Schema de usuarios
│   │   └── Product.js   → Schema de productos
│   └── email.js         → Servicio de emails
├── productos.js         → GET /api/productos
├── categorias.js        → GET /api/categorias
├── producto/[id].js     → GET /api/producto/:id
├── sitemap.xml.js       → GET /api/sitemap.xml
└── robots.txt.js        → GET /api/robots.txt
```

---

## 1. Backend - Endpoints de Autenticación (Serverless)

### ✅ Archivo: `api/auth/login.js`

Endpoint serverless para login:

- **Método:** POST
- **URL:** `/api/auth/login`
- **Recibe:** `{ email, password }`
- **Proceso:**
  1. Conecta a MongoDB Atlas (con cache)
  2. Busca usuario por email
  3. Compara contraseña con bcrypt
  4. Genera JWT token
- **Retorna:** `{ token }`

### ✅ Archivo: `api/auth/register.js`

Endpoint serverless para registro:

- **Método:** POST
- **URL:** `/api/auth/register`
- **Recibe:** `{ email, password }`
- **Proceso:**
  1. Conecta a MongoDB Atlas
  2. Verifica si el email ya existe
  3. Crea usuario (bcrypt hash automático via pre-save hook)
  4. Genera JWT token
  5. Envía email de bienvenida (asíncrono)
- **Retorna:** `{ message, token, user }`

### 🔐 Conexión a MongoDB

**Archivo:** `api/_lib/db.js`

- ✅ **Conexión cacheada** (optimizada para serverless)
- ✅ Usa `process.env.DB_URI` (MongoDB Atlas)
- ✅ Pool de conexiones: min 2, max 10
- ✅ Timeouts configurados para serverless
- ✅ Retry automático de escrituras/lecturas

**URI de MongoDB Atlas:**
```
mongodb+srv://marianoaliandri:***@colchonqn.9nrhzql.mongodb.net/
```

### 🔑 Autenticación JWT

**Archivo:** `api/_lib/auth.js`

- Genera tokens con `jsonwebtoken`
- Secret: `process.env.TOKEN_SECRET`
- Expiración: 24 horas
- Middleware `verifyToken` para proteger rutas

---

## 2. Frontend - API Service

### Archivo: `Frontend/src/services/api.js`

Configuración correcta:

```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Interceptor que agrega el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['auth-token'] = token;
  }
  return config;
});
```

Funciones disponibles:

- **login(email, password)** → POST /auth/login
- **register(email, password)** → POST /auth/register

---

## 3. Frontend - AuthModal

### Archivo: `Frontend/src/components/AuthModal.jsx`

El modal de autenticación:

- ✅ Maneja login y registro
- ✅ Validación de contraseñas (mínimo 6 caracteres)
- ✅ Confirmación de contraseña en registro
- ✅ Recordar usuario (localStorage)
- ✅ Manejo de errores
- ✅ Estados de carga

---

## 4. Store de Autenticación

### Archivo: `Frontend/src/store/authStore.jsx`

Usando Zustand para manejar el estado:

```javascript
setAuth: (token, user) => {
  localStorage.setItem('authToken', token);
  if (user?.email) {
    localStorage.setItem('userEmail', user.email);
  }
  set({ isAuthenticated: true, token, user });
}
```

---

## Posibles Problemas y Soluciones

### Problema 1: CORS

**Síntoma:** Error de CORS en desarrollo

**Solución:** Verificar que el backend tenga configurado:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    // ... otros orígenes
  ]
}));
```

**Estado:** ✅ Ya configurado en `Backend/server.js:35-48`

---

### Problema 2: URL de API Incorrecta

**Síntoma:** 404 Not Found en /api/auth/login

**Diagnóstico:**
- Desarrollo: Debe usar `http://localhost:3000/api`
- Producción: Debe usar `/api` (relativo)

**Solución:** Verificar archivo `.env`:

```bash
# Desarrollo
VITE_API_URL=http://localhost:3000/api

# Producción
VITE_API_URL=/api
```

**Estado:** ✅ Ya configurado correctamente

---

### Problema 3: Variables de entorno en Vercel

**Síntoma:** 500 Internal Server Error en producción

**Solución:**

Verificar que las siguientes variables estén configuradas en **Vercel Dashboard → Settings → Environment Variables**:

```
DB_URI = mongodb+srv://marianoaliandri:***@colchonqn.9nrhzql.mongodb.net/...
TOKEN_SECRET = tu_clave_secreta_aqui
EMAIL_HOST = smtp.zoho.com
EMAIL_PORT = 465
EMAIL_USER = colchonqn@marianoaliandri.com.ar
EMAIL_PASS = ***
```

**Nota:** Las serverless functions de Vercel NO requieren que el backend esté "corriendo". Se activan automáticamente con cada request.

---

### Problema 4: Falta variable de entorno TOKEN_SECRET

**Síntoma:** Token inválido después de login exitoso

**Solución:**

Crear archivo `Backend/.env` con:

```
TOKEN_SECRET=tu_clave_secreta_segura_aqui
DB_URI=mongodb://localhost:27017/colchonespremium_v2
```

**Nota:** El backend usa un fallback por defecto, pero es recomendable usar una clave propia.

---

## Cómo Probar la Autenticación

### 1. Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Usar Token para Endpoint Protegido

```bash
curl -X GET http://localhost:3000/api/ventas/historial \
  -H "auth-token: TU_TOKEN_AQUI"
```

---

## Checklist de Debugging

- [ ] ¿Está corriendo el backend en el puerto 3000?
- [ ] ¿MongoDB está conectado?
- [ ] ¿El archivo .env tiene VITE_API_URL correcto?
- [ ] ¿Hay errores en la consola del navegador (F12)?
- [ ] ¿Hay errores en la consola del backend?
- [ ] ¿El email ya existe en la base de datos? (error 11000)
- [ ] ¿La contraseña tiene al menos 6 caracteres?

---

## Errores Comunes y Sus Mensajes

### Error: "El email ya está registrado"

**Causa:** El usuario ya existe en la base de datos

**Solución:** Usar login en lugar de registro, o usar otro email

---

### Error: "Credenciales inválidas"

**Causa:** Email o contraseña incorrectos

**Solución:** Verificar que el usuario existe y la contraseña es correcta

---

### Error: "Acceso denegado: Token no proporcionado"

**Causa:** No se envió el token en el header

**Solución:** Asegurarse de que el interceptor de axios esté funcionando

---

### Error: "Token inválido"

**Causa:** Token expirado o corrupto

**Solución:** Hacer login nuevamente

---

## Monitoreo en Desarrollo

### Backend (Terminal)

Al hacer login/registro, deberías ver logs como:

```
POST /api/auth/register 201 123ms
POST /api/auth/login 200 89ms
```

### Frontend (Browser DevTools)

En la pestaña Network:

- Request URL: `http://localhost:3000/api/auth/login`
- Status: 200 OK
- Response: `{ token: "..." }`

En la pestaña Application → Local Storage:

- `authToken`: "eyJhbGciOiJIUz..."
- `userEmail`: "test@example.com"

---

## Estado Final

✅ **La autenticación está correctamente configurada**

Si experimentas problemas, es probable que sea uno de estos:

1. El backend no está corriendo
2. MongoDB no está conectado
3. CORS en desarrollo (usar .env.development con URL completa)
4. Email ya registrado

**Siguiente paso:** Si el problema persiste, por favor proporciona:
- Error específico de la consola del navegador
- Error del backend (si lo hay)
- Screenshot del error

---

**Fecha:** 2025-11-15
**Versión:** 1.0
