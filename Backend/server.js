import express from 'express';
import cors from 'cors';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // Importamos Mongoose
import bcrypt from 'bcryptjs'; // Para encriptar contraseñas
import jwt from 'jsonwebtoken'; // Para los tokens de seguridad

// Configuración __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// =================== CONFIGURACIÓN DE LA BASE DE DATOS ===================
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/colchonespremium_v2';
mongoose.connect(dbUri)
    .then(() => console.log('✅ Conectado a la base de datos MongoDB'))
    .catch(err => console.error('❌ Error de conexión a la base de datos:', err));

// =================== MIDDLEWARES ===================
app.use(cors({
    origin: ['https://colchonqn2.netlify.app', 'http://localhost:5500']
}));
app.use(express.json());

// =================== MODELOS DE DATOS (Mongoose Schemas) ===================

// Esquema para el modelo de usuario
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Encriptar la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);

// Esquema para el modelo de ventas/presupuestos
const VentaSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fecha: { type: Date, default: Date.now },
    productos: [
        {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true },
            precioUnitario: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    estado: { type: String, enum: ['presupuesto', 'venta'], default: 'presupuesto' }
});
const Venta = mongoose.model('Venta', VentaSchema);

// =================== MIDDLEWARE DE AUTENTICACIÓN (JWT) ===================

// Middleware para verificar el token JWT en las rutas protegidas
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Acceso denegado: Token no proporcionado.');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET || 'mi_clave_secreta_por_defecto');
        req.user = verified;
        next(); // Continúa con la siguiente función en la ruta
    } catch (err) {
        res.status(400).send('Token inválido.');
    }
};

// =================== RUTAS DE AUTENTICACIÓN ===================

// Ruta para registrar un nuevo usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
});

// Ruta para el inicio de sesión de un usuario
app.post('/api/auth/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ error: 'Credenciales inválidas.' });

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).json({ error: 'Credenciales inválidas.' });

        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET || 'mi_clave_secreta_por_defecto', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});


// =================== RUTAS PARA PRODUCTOS Y CATEGORÍAS (CÓDIGO ORIGINAL) ===================

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: "API de Colchones Premium V2.0",
        endpoints: {
            productos: "/api/colchones",
            categorias: "/api/categorias",
            auth: {
                register: "/api/auth/register (POST)",
                login: "/api/auth/login (POST)"
            },
            ventas: "/api/ventas (POST, protegido)"
        }
    });
});


// Cache de productos (mejora rendimiento)
let cacheProductos = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para generar IDs únicos
const generarIdUnico = (categoria, contador) => {
    const prefijo = categoria ? categoria.slice(0, 3).toUpperCase() : 'GEN';
    return `${prefijo}-${contador.toString().padStart(3, '0')}`;
};

// Leer Excel con cache
const leerExcel = () => {
    const now = Date.now();
    if (cacheProductos && (now - cacheTimestamp) < CACHE_DURATION) {
        return cacheProductos;
    }

    try {
        const workbook = xlsx.readFile(path.join(__dirname, 'precios_colchones.xlsx'));
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Procesar datos y actualizar cache
        const contadores = {};
        cacheProductos = data
            .filter(item => 
                item.Mostrar?.toLowerCase() === "si" && 
                item.Imagen?.trim() !== ""
            )
            .map(item => {
                const categoria = item.Categoria || 'General';
                contadores[categoria] = (contadores[categoria] || 0) + 1;
                
                return {
                    ...item,
                    _id: generarIdUnico(categoria, contadores[categoria])
                };
            });

        cacheTimestamp = now;
        return cacheProductos;

    } catch (err) {
        console.error('Error al leer Excel:', err);
        return null;
    }
};

// Endpoint para productos (con cache)
app.get('/api/colchones', (req, res) => {
    const productos = leerExcel();
    if (!productos) {
        return res.status(500).json({ error: 'Error al cargar productos' });
    }
    res.json(productos);
});

// Endpoint para categorías (optimizado)
app.get('/api/categorias', (req, res) => {
    const productos = leerExcel();
    if (!productos) {
        return res.status(500).json({ error: 'Error al cargar categorías' });
    }

    const categorias = [...new Set(
        productos.map(p => p.Categoria).filter(Boolean)
    )];
    
    res.json(categorias);
});

// Endpoint para guardar presupuestos/ventas (protegido con el token)
app.post('/api/ventas', verifyToken, async (req, res) => {
    try {
        const { productos, total, estado } = req.body;
        const newVenta = new Venta({
            userId: req.user.id, // ID del usuario obtenido del token
            productos,
            total,
            estado
        });
        await newVenta.save();
        res.status(201).json({ message: 'Venta registrada exitosamente.', venta: newVenta });
    } catch (err) {
        console.error('Error al guardar la venta:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log(`- GET /api/colchones`);
    console.log(`- GET /api/categorias`);
    console.log(`- POST /api/auth/register`);
    console.log(`- POST /api/auth/login`);
    console.log(`- POST /api/ventas (protegido)`);
});