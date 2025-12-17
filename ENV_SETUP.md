# Configuración de Variables de Entorno

## 📋 Variables necesarias en Vercel

Ir a **Vercel → Settings → Environment Variables** y agregar:

### 1. Base de Datos MongoDB
```bash
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/colchonespremium?retryWrites=true&w=majority
```

### 2. Autenticación JWT
```bash
JWT_SECRET=tu-secreto-super-seguro-generalo-con-openssl-rand-base64-32
```
**Generar secreto seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Gemini AI (Ya configurado)
```bash
GEMINI_API_KEY=AIzaSy...
```

### 4. Cloudinary (Subida de imágenes)
```bash
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu-api-secret
```
**Cómo obtener:**
1. Ir a https://cloudinary.com/ (o usar cuenta existente)
2. Dashboard → Account Details
3. Copiar Cloud Name, API Key, API Secret

### 5. Mercado Pago
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...  (PRODUCCIÓN)
# O para testing:
MERCADOPAGO_ACCESS_TOKEN=TEST-...
```
**Cómo obtener:**
1. Ir a https://www.mercadopago.com.ar/developers
2. Crear aplicación "Colchones Premium"
3. Tus credenciales → Copiar Access Token

**IMPORTANTE:** Usar credenciales de TEST para desarrollo, PRODUCCIÓN para el sitio real.

### 6. Email (Nodemailer + Zoho) - Ya configurado
```bash
ZOHO_MAIL_USER=info@aluminehogaryconfort.com.ar
ZOHO_MAIL_PASS=Base64EncodedPassword
```

### 7. URLs
```bash
# URL del frontend (ajustar según tu dominio)
FRONTEND_URL=https://tu-dominio.vercel.app

# URL de Vercel (se usa automáticamente, pero puedes especificarla)
VERCEL_URL=tu-dominio.vercel.app
```

---

## 🎨 Variables de Frontend (.env en Frontend/)

Crear archivo `Frontend/.env`:

```bash
# URL de la API (deja vacío si está en el mismo dominio)
VITE_API_URL=/api

# O si usás localhost en desarrollo:
# VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Checklist de Configuración

### Paso 1: Configurar Cloudinary
- [ ] Crear cuenta en Cloudinary (o usar existente)
- [ ] Copiar Cloud Name, API Key, API Secret
- [ ] Agregar variables en Vercel

### Paso 2: Configurar Mercado Pago
- [ ] Crear cuenta en Mercado Pago Developers
- [ ] Crear aplicación "Colchones Premium"
- [ ] Copiar Access Token de TEST (para desarrollo)
- [ ] Copiar Access Token de PRODUCCIÓN (para sitio real)
- [ ] Agregar MERCADOPAGO_ACCESS_TOKEN en Vercel
- [ ] Configurar URL del webhook en Mercado Pago:
  ```
  https://tu-dominio.vercel.app/api/mercadopago/webhook
  ```

### Paso 3: Generar JWT Secret
- [ ] Ejecutar: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] Copiar resultado
- [ ] Agregar JWT_SECRET en Vercel

### Paso 4: Frontend URL
- [ ] Agregar FRONTEND_URL con tu dominio de Vercel

### Paso 5: Deploy
- [ ] Hacer push a GitHub
- [ ] Vercel redeploy automático
- [ ] Verificar que las variables están cargadas

---

## 🧪 Testing

### Test de Autenticación
```bash
# Registrar usuario
curl -X POST https://tu-dominio.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nombre":"Test"}'

# Login
curl -X POST https://tu-dominio.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Test de Admin (necesita ser admin)
```bash
# Listar productos (requiere token de admin)
curl https://tu-dominio.vercel.app/api/admin/products \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Test de Mercado Pago
1. Agregar productos al carrito
2. Click en "Pagar con Mercado Pago"
3. Usar tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

---

## 🔐 Crear Usuario Admin

Por defecto, todos los usuarios registrados son "customer". Para hacer un usuario admin:

1. Conectar a MongoDB (Compass o Atlas)
2. Buscar el usuario en la colección `users`
3. Editar el campo `role` de `"customer"` a `"admin"`

O usar script:
```javascript
// Ejecutar en MongoDB Atlas Data Explorer o Compass
db.users.updateOne(
  { email: "tu-email@gmail.com" },
  { $set: { role: "admin" } }
)
```

---

## 🚀 Cómo usar las nuevas funcionalidades

### Panel de Administración
1. Crear usuario admin (ver arriba)
2. Login en la web
3. Ir a: `https://tu-dominio.vercel.app/admin`
4. Crear/editar/eliminar productos

### Mercado Pago (Usuarios)
1. Agregar productos al carrito
2. Click en "Mercado Pago" (requiere estar logueado)
3. Completar pago en Mercado Pago
4. Redirige a página de éxito/error

### Webhook de Mercado Pago
- Se configura automáticamente al crear la preferencia
- Cuando un pago se aprueba:
  - Se guarda la orden en MongoDB
  - Se envía email al cliente
  - Se envía email al admin

---

## ⚠️ Importante

1. **JWT_SECRET**: NUNCA commitear en Git, siempre en variables de entorno
2. **Mercado Pago TEST vs PROD**: Usar TEST en desarrollo, PROD en producción
3. **Webhook URL**: Debe ser HTTPS (Vercel lo provee automáticamente)
4. **Cloudinary**: Free tier = 25GB storage, 25GB bandwidth/mes (suficiente para empezar)

---

## 📊 Límites de Vercel (Free Tier)

- **Serverless Functions**: 100GB-hours/mes
- **Bandwidth**: 100GB/mes
- **Build minutes**: 6,000 minutos/mes

**Para tu caso**: El panel admin + Mercado Pago NO aumenta significativamente el uso, porque:
- El admin solo lo usás vos (bajo tráfico)
- Mercado Pago webhook es 1 request por venta
- Las imágenes están en Cloudinary (no consumen bandwidth de Vercel)

---

## 🆘 Troubleshooting

### Error: "Token de autenticación requerido"
→ Verificar que estás logueado y el token se envía en el header `Authorization: Bearer TOKEN`

### Error: "Acceso denegado: Solo administradores"
→ Verificar que tu usuario tiene `role: 'admin'` en MongoDB

### Error al crear preferencia de Mercado Pago
→ Verificar MERCADOPAGO_ACCESS_TOKEN en Vercel
→ Verificar que el usuario esté logueado

### Webhook de Mercado Pago no llega
→ Verificar que la URL es HTTPS
→ Verificar en Mercado Pago Dashboard → Notificaciones IPN
→ Ver logs en Vercel → Functions → mercadopago-webhook

### Error al subir imagen
→ Verificar credenciales de Cloudinary
→ Verificar que la imagen sea < 10MB
