import express from 'express';
import cors from 'cors';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// =================== CONFIGURACIÓN INICIAL ===================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// =================== CONFIGURACIÓN DE LA BASE DE DATOS ===================
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/colchonespremium_v2';
mongoose.connect(dbUri)
    .then(() => {
        console.log('✅ Conectado a la base de datos MongoDB');
        // Llamar a la función de migración aquí para asegurar que se ejecute después de la conexión
        migrateExcelDataToMongoDB();
    })
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

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);

// Esquema para el modelo de productos
const ProductSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    imagen: { type: String },
    mostrar: { type: String }
});
const Product = mongoose.model('Product', ProductSchema);

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
const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Acceso denegado: Token no proporcionado.');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET || 'mi_clave_secreta_por_defecto');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Token inválido.');
    }
};

// =================== RUTAS DE AUTENTICACIÓN ===================
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

// =================== LÓGICA DE MIGRACIÓN (EJECUCIÓN ÚNICA AL INICIAR) ===================

// Función para generar IDs únicos
const generarIdUnico = (categoria, contador) => {
    const prefijo = categoria ? categoria.slice(0, 3).toUpperCase() : 'GEN';
    return `${prefijo}-${contador.toString().padStart(3, '0')}`;
};

const migrateExcelDataToMongoDB = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount === 0) { // Solo migrar si la colección de productos está vacía
            const workbook = xlsx.readFile(path.join(__dirname, 'precios_colchones.xlsx'));
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);

            const productsToInsert = [];
            const contadores = {};

            data.forEach(item => {
                if (item.Mostrar?.toLowerCase() === "si" && item.Imagen?.trim() !== "") {
                    const categoria = item.Categoria || 'General';
                    contadores[categoria] = (contadores[categoria] || 0) + 1;
                    productsToInsert.push({
                        _id: generarIdUnico(categoria, contadores[categoria]),
                        nombre: item.Nombre || '',
                        descripcion: item.Descripcion || '',
                        precio: item.Precio || 0,
                        categoria: categoria,
                        imagen: item.Imagen || '',
                        mostrar: item.Mostrar || 'no'
                    });
                }
            });

            if (productsToInsert.length > 0) {
                await Product.insertMany(productsToInsert);
                console.log(`✅ Migración exitosa: ${productsToInsert.length} productos guardados en la base de datos.`);
            }
        } else {
            console.log(`ℹ️ La colección de productos ya contiene ${productCount} documentos. No se realizó la migración.`);
        }
    } catch (err) {
        console.error('❌ Error durante la migración del archivo Excel:', err);
    }
};

// =================== RUTAS PARA PRODUCTOS Y CATEGORÍAS (AHORA USANDO MONGO) ===================

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

// Endpoint para productos
app.get('/api/colchones', async (req, res) => {
    try {
        const productos = await Product.find({ mostrar: 'si' });
        res.json(productos);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// Endpoint para categorías
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await Product.distinct('categoria', { mostrar: 'si' });
        res.json(categorias);
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ error: 'Error al cargar categorías' });
    }
});

// Endpoint para guardar presupuestos/ventas (protegido con el token)
app.post('/api/ventas', verifyToken, async (req, res) => {
    try {
        const { productos, total, estado } = req.body;
        const newVenta = new Venta({
            userId: req.user.id,
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

// =================== INICIAR SERVIDOR ===================
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log('Endpoints disponibles:');
    console.log(`- GET /api/colchones`);
    console.log(`- GET /api/categorias`);
    console.log(`- POST /api/auth/register`);
    console.log(`- POST /api/auth/login`);
    console.log(`- POST /api/ventas (protegido)`);
});