# 🚀 Resumen Rápido - Nuevas Funcionalidades

## ✅ ¿Qué se agregó?

1. **Autenticación completa** (JWT + bcrypt)
2. **Panel de administración** para gestionar productos
3. **Mercado Pago** integrado con webhook
4. **Cloudinary** para subir imágenes optimizadas

---

## 🎯 Para Empezar AHORA

### 1. Configurar Variables de Entorno en Vercel

```bash
# Mínimo necesario
MONGODB_URI=mongodb+srv://...                    # Ya lo tenés
JWT_SECRET=genera-uno-nuevo                      # Generar nuevo
CLOUDINARY_CLOUD_NAME=tu-cloud                   # Crear cuenta
CLOUDINARY_API_KEY=123456                        # En dashboard
CLOUDINARY_API_SECRET=secret                     # En dashboard
MERCADOPAGO_ACCESS_TOKEN=TEST-...                # Para testing
FRONTEND_URL=https://tu-dominio.vercel.app       # Tu dominio
```

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Crear Primer Usuario Admin

**Opción A - Script (más rápido):**
```bash
npm run create-admin tu-email@gmail.com password123
```

**Opción B - MongoDB Manual:**
1. Registrarte en la web normalmente
2. Ir a MongoDB Atlas → Collections → users
3. Editar tu usuario:
```javascript
{ role: "admin" }
```

### 3. Configurar Cloudinary

1. Ir a https://cloudinary.com (o usar cuenta existente)
2. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret
3. Pegar en Vercel

### 4. Configurar Mercado Pago

1. Ir a https://www.mercadopago.com.ar/developers
2. Crear app "Colchones Premium"
3. Copiar Access Token de **TEST**
4. Agregar a Vercel como `MERCADOPAGO_ACCESS_TOKEN`

### 5. Deploy

```bash
git add .
git commit -m "feat: Sistema completo de e-commerce"
git push
```

---

## 📱 Usar el Sistema

### Como Admin:

1. Login en tu sitio
2. Ir a: `https://tu-dominio.vercel.app/admin`
3. Crear/editar productos

### Como Cliente:

1. Agregar productos al carrito
2. Click "Mercado Pago" (requiere login)
3. Pagar y listo

---

## 🧪 Testing Rápido

**Test con tarjeta de prueba:**
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/25
Resultado: Aprobado ✅
```

---

## 📚 Documentación Completa

- [IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md) - Guía detallada
- [ENV_SETUP.md](./ENV_SETUP.md) - Variables de entorno
- [.env.example](./.env.example) - Plantilla de .env

---

## ⚡ Comandos Útiles

```bash
# Crear admin
npm run create-admin email@test.com password123

# Ver logs
vercel logs --follow

# Deploy manual
vercel --prod
```

---

## 🔧 Troubleshooting Express

**Error: "Token inválido"**
→ Hacer logout y login de nuevo

**Error: "Acceso denegado"**
→ Verificar que tu usuario es admin en MongoDB

**Error al crear pago**
→ Verificar MERCADOPAGO_ACCESS_TOKEN en Vercel

---

## 🎉 ¡Listo!

Con esto ya tenés:
- ✅ Login/Registro funcionando
- ✅ Panel admin en `/admin`
- ✅ Mercado Pago integrado
- ✅ Chatbot IA funcionando
- ✅ Todo gratis en Vercel

**Próximo paso:** Crear tu primer producto de prueba en el panel de admin.
