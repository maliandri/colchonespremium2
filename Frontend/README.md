# Colchones Premium - Frontend (React + Vite)

## 🚀 Nueva Versión Moderna

Este es el frontend modernizado de Colchones Premium, construido con:

- **React 18** - Biblioteca UI moderna
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework de estilos utility-first
- **Zustand** - Gestión de estado ligera
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Cloudinary** - Imágenes optimizadas automáticamente

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en [http://localhost:5173](http://localhost:5173)

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 👀 Preview del Build

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   └── CloudinaryImage.jsx
│   ├── pages/            # Páginas de la aplicación
│   │   └── HomePage.jsx
│   ├── services/         # Servicios y API
│   │   └── api.js
│   ├── store/            # Estado global (Zustand)
│   │   ├── cartStore.jsx
│   │   └── authStore.jsx
│   ├── utils/            # Utilidades
│   ├── assets/           # Imágenes y archivos estáticos
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales (Tailwind)
├── public/               # Archivos públicos
├── index.html            # HTML template
├── vite.config.js        # Configuración de Vite
├── tailwind.config.js    # Configuración de Tailwind
├── postcss.config.js     # Configuración de PostCSS
├── .env                  # Variables de entorno
└── package.json          # Dependencias
```

## 🎨 Características

### ✅ Imágenes de Cloudinary
- Carga automática de imágenes optimizadas desde Cloudinary
- Diferentes tamaños según el contexto (thumb, card, detail)
- Lazy loading automático
- Placeholder mientras carga
- Fallback a imagen por defecto si hay error

### ✅ Carrito de Compras
- Agregar/remover productos
- Persistencia en localStorage
- Contador de items en tiempo real
- Cálculo automático de totales

### ✅ Autenticación
- Login y registro de usuarios
- Persistencia de sesión
- Gestión de tokens JWT
- Logout automático en caso de token expirado

### ✅ Filtros y Búsqueda
- Búsqueda por nombre y descripción
- Filtro por categoría
- Ordenamiento múltiple (nombre, precio)
- Contador de resultados

### ✅ Responsive Design
- Diseño adaptable a todos los dispositivos
- Mobile-first approach
- Menú hamburguesa en móviles
- Grid responsivo para productos

## 🔧 Configuración

### Variables de Entorno (.env)

```env
VITE_API_URL=https://colchonespremium2.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=dlshym1te
VITE_CLOUDINARY_FOLDER=alumine
```

### Cambiar la URL del Backend

Si necesitas cambiar la URL del backend, actualiza el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api  # Para desarrollo local
# o
VITE_API_URL=https://tu-backend.com/api  # Para producción
```

## 📚 Componentes Principales

### CloudinaryImage
Componente optimizado para mostrar imágenes de Cloudinary:

```jsx
<CloudinaryImage
  product={producto}
  size="card"  // thumb | card | detail
  alt="Descripción"
  className="w-full h-full"
/>
```

### ProductCard
Tarjeta de producto con imagen, información y botón de agregar al carrito:

```jsx
<ProductCard product={producto} />
```

## 🎯 Stores (Zustand)

### Cart Store
```javascript
import { useCartStore } from './store/cartStore';

const addToCart = useCartStore((state) => state.addToCart);
const cart = useCartStore((state) => state.cart);
const getTotalItems = useCartStore((state) => state.getTotalItems);
```

### Auth Store
```javascript
import { useAuthStore } from './store/authStore';

const { login, register, logout, isAuthenticated } = useAuthStore();
```

## 🚀 Deploy en Netlify

1. Conecta tu repositorio a Netlify
2. Configura los build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Agrega las variables de entorno en Netlify:
   - `VITE_API_URL`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_FOLDER`

El archivo `_redirects` ya está configurado para SPA routing.

## 📱 PWA (Opcional)

Para convertir la aplicación en PWA, puedes agregar:
```bash
npm install vite-plugin-pwa
```

Y configurarlo en `vite.config.js`

## 🔗 Links Útiles

- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React](https://react.dev/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Documentación de Zustand](https://zustand-demo.pmnd.rs/)
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)

## 📝 Notas

- El frontend vanilla antiguo está respaldado en `_old_vanilla/`
- Las imágenes optimizadas se cargan directamente desde Cloudinary
- El código está optimizado para SEO y rendimiento
- Todas las rutas están configuradas para SPA

---

**Desarrollado con ❤️ para Colchones Premium**
