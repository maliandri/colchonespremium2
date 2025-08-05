import express from 'express';
import cors from 'cors';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { enviarEmail } from './emailService.js'; // Asegúrate de que esta importación esté presente

// ... (resto de tus importaciones y configuraciones iniciales)

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
        // migrateExcelDataToMongoDB(); // Comentado si no necesitas que se ejecute en cada inicio
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

// Esquema para el modelo de productos (mantener si lo usas)
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

// Esquema para el modelo de ventas/presupuestos (mantener si lo usas)
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
    const { email, password } = req.body; // Desestructuramos email y password
    try {
        const newUser = new User({ email, password });
        await newUser.save();

        // Generar el token JWT para el nuevo usuario
        const token = jwt.sign({ id: newUser._id }, process.env.TOKEN_SECRET || 'mi_clave_secreta_por_defecto', { expiresIn: '1h' });

        // ✅ AGREGADO: Enviar el correo de bienvenida
        const asunto = '¡Bienvenido/a a Colchones Premium!';
        const cuerpoHtml = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                        .header { background-color: #4CAF50; color: white; padding: 15px 0; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; text-align: center; }
                        .button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
                        .footer { margin-top: 30px; font-size: 0.9em; color: #777; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>¡Gracias por unirte a Colchones Premium!</h2>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${email}</strong>,</p>
                            <p>Estamos encantados de tenerte con nosotros. Ahora eres parte de nuestra comunidad y tienes acceso a la mejor selección de colchones.</p>
                            <p>Explora nuestro catálogo y encuentra el colchón perfecto para tu descanso.</p>
                            <a href="https://colchonqn2.netlify.app" class="button">Ir a la Tienda</a>
                            <p class="footer">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                            <p class="footer">Saludos,<br>El equipo de Colchones Premium</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        try {
            await enviarEmail({
                destinatario: email, // Usamos el email del nuevo usuario
                asunto: asunto,
                cuerpoHtml: cuerpoHtml
            });
            console.log(`Correo de bienvenida enviado a ${email}`);
        } catch (emailError) {
            console.error('Error al enviar el correo de bienvenida:', emailError);
            // Si el correo no se envía, el registro del usuario no se interrumpe.
            // Solo se registra el error.
        }

        res.status(201).json({
            message: 'Usuario registrado exitosamente. Se ha enviado un correo de bienvenida.',
            token: token,
            user: { id: newUser._id, email: newUser.email }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }
        console.error('Error al registrar el usuario:', err);
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

// =================== LÓGICA DE MIGRACIÓN (CORREGIDA) ===================

// Función para generar IDs únicos
const generarIdUnico = (categoria, contador) => {
    const prefijo = categoria 
        ? categoria
            .replace(/[^a-zA-Z0-9]/g, '') // Remover caracteres especiales
            .slice(0, 3)
            .toUpperCase()
        : 'GEN';
    
    return `${prefijo}-${contador.toString().padStart(4, '0')}`;
};

// ✅ FUNCIÓN CORREGIDA DE MIGRACIÓN
const migrateExcelDataToMongoDB = async () => {
    try {
        console.log('🔄 Iniciando migración de datos del Excel...');
        
        const productCount = await Product.countDocuments();
        console.log(`📊 Productos existentes en BD: ${productCount}`);
        
        const excelPath = path.join(__dirname, 'precios_colchones.xlsx');
        console.log(`📁 Buscando archivo Excel en: ${excelPath}`);
        
        // ✅ CORREGIDO: Usar fs en lugar de require('fs')
        if (!fs.existsSync(excelPath)) {
            console.error('❌ Archivo Excel no encontrado:', excelPath);
            console.log('📂 Listando archivos en el directorio:');
            try {
                const files = fs.readdirSync(__dirname);
                console.log('📁 Archivos encontrados:', files);
                
                // Buscar archivos .xlsx
                const xlsxFiles = files.filter(file => file.endsWith('.xlsx'));
                console.log('📊 Archivos Excel encontrados:', xlsxFiles);
                
                if (xlsxFiles.length > 0) {
                    console.log('💡 Sugerencia: Verifica el nombre del archivo Excel');
                }
            } catch (err) {
                console.log('⚠️ No se pudo listar el directorio:', err.message);
            }
            return;
        }
        
        console.log('✅ Archivo Excel encontrado, procediendo con la lectura...');
        
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        console.log(`📋 Procesando hoja: ${sheetName}`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        console.log(`📝 Registros encontrados en Excel: ${data.length}`);
        console.log('📋 Columnas disponibles:', Object.keys(data[0] || {}));
        
        // Mostrar muestra de datos para debugging
        if (data.length > 0) {
            console.log('📄 Muestra de los primeros 3 registros:');
            data.slice(0, 3).forEach((item, index) => {
                console.log(`  ${index + 1}:`, {
                    Nombre: item.Nombre,
                    Categoria: item.Categoria,
                    Precio: item.Precio,
                    Mostrar: item.Mostrar,
                    TieneImagen: item.Imagen ? 'Sí' : 'No'
                });
            });
        }
        
        const productsToProcess = [];
        const contadores = {};
        let procesados = 0;
        let omitidos = 0;
        
        data.forEach((item, index) => {
            const mostrar = item.Mostrar?.toString().toLowerCase().trim();
            
            console.log(`🔍 Procesando fila ${index + 1}:`, {
                nombre: item.Nombre,
                categoria: item.Categoria,
                mostrar: mostrar,
                seIncluye: mostrar === "si" || mostrar === "sí"
            });
            
            // Condiciones más flexibles para incluir productos
            if (mostrar === "si" || mostrar === "sí") {
                const categoria = item.Categoria?.toString().trim() || 'General';
                contadores[categoria] = (contadores[categoria] || 0) + 1;
                
                productsToProcess.push({
                    _id: generarIdUnico(categoria, contadores[categoria]),
                    nombre: item.Nombre?.toString().trim() || `Producto ${index + 1}`,
                    descripcion: item.Descripcion?.toString().trim() || '',
                    precio: parseFloat(item.Precio) || 0,
                    categoria: categoria,
                    imagen: item.Imagen?.toString().trim() || '',
                    mostrar: 'si'
                });
                procesados++;
            } else {
                omitidos++;
            }
        });
        
        console.log(`✅ Productos a procesar: ${procesados}`);
        console.log(`⏭️ Productos omitidos: ${omitidos}`);
        console.log('📊 Productos por categoría:', contadores);
        
        if (productsToProcess.length > 0) {
            // Usar upsert para actualizar productos existentes o crear nuevos
            const bulkOps = productsToProcess.map(product => ({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $set: product },
                    upsert: true
                }
            }));
            
            const result = await Product.bulkWrite(bulkOps);
            
            console.log('📈 Resultado de la migración:');
            console.log(`  ✅ Insertados: ${result.insertedCount || 0}`);
            console.log(`  🔄 Actualizados: ${result.modifiedCount || 0}`);
            console.log(`  📋 Sin cambios: ${(result.matchedCount || 0) - (result.modifiedCount || 0)}`);
            
            // Verificar categorías únicas después de la migración
            const categorias = await Product.distinct('categoria', { mostrar: 'si' });
            console.log('🏷️ Categorías disponibles después de la migración:', categorias);
            
            console.log(`✅ Migración completada exitosamente`);
            
        } else {
            console.log('⚠️ No se encontraron productos válidos para migrar');
            console.log('💡 Verifica que el Excel tenga:');
            console.log('   - Columna "Mostrar" con valores "si" o "sí"');
            console.log('   - Columna "Categoria" con nombres de categorías');
            console.log('   - Columna "Nombre" con nombres de productos');
            console.log('   - Columna "Precio" con precios numéricos');
        }
        
        // Estadísticas finales
        const finalCount = await Product.countDocuments();
        const categoriasCount = await Product.distinct('categoria');
        console.log(`📊 Total de productos en BD: ${finalCount}`);
        console.log(`🏷️ Total de categorías: ${categoriasCount.length}`);
        
    } catch (err) {
        console.error('❌ Error durante la migración del archivo Excel:', err);
        console.error('📋 Stack trace:', err.stack);
    }
};

// =================== RUTAS PARA PRODUCTOS Y CATEGORÍAS (MEJORADAS) ===================

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
            ventas: "/api/ventas (POST, protegido)",
            admin: {
                migrate: "/api/admin/migrate (GET, debugging)",
                productos: "/api/admin/productos/todos (GET, debugging)"
            }
        }
    });
});

// Endpoint para productos MEJORADO
app.get('/api/colchones', async (req, res) => {
    try {
        console.log('📋 Solicitud de productos recibida');
        
        const productos = await Product.find({ mostrar: 'si' }).sort({ categoria: 1, nombre: 1 });
        
        console.log(`✅ Enviando ${productos.length} productos`);
        console.log('🏷️ Categorías encontradas:', [...new Set(productos.map(p => p.categoria))]);
        
        res.json(productos);
    } catch (err) {
        console.error('❌ Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al cargar productos' });
    }
});

// Endpoint para categorías MEJORADO
app.get('/api/categorias', async (req, res) => {
    try {
        console.log('🏷️ Solicitud de categorías recibida');
        
        const categorias = await Product.distinct('categoria', { mostrar: 'si' });
        
        console.log(`✅ Enviando ${categorias.length} categorías:`, categorias);
        
        res.json(categorias);
    } catch (err) {
        console.error('❌ Error al obtener categorías:', err);
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

// Endpoint para enviar el presupuesto por email
app.post('/api/presupuesto/enviar', async (req, res) => {
    const { cliente, vendedor, productos, total } = req.body;

    if (!cliente || !cliente.email) {
        return res.status(400).json({ error: 'Falta el email del cliente.' });
    }

    // Generar el cuerpo del correo en formato HTML
    const cuerpoHtml = `
        <h1>Presupuesto - Colchones Premium</h1>
        <p>Hola ${cliente.nombre || ''},</p>
        <p>Gracias por tu interés. A continuación, te enviamos el presupuesto solicitado por nuestro vendedor <strong>${vendedor.nombre || 'N/A'}</strong>.</p>

        <h3>Detalle del Pedido:</h3>
        <ul>
            ${productos.map(p => `<li>${p.cantidad} x ${p.nombre} - $${p.subtotal.toFixed(2)}</li>`).join('')}
        </ul>
        <hr>
        <h3><strong>Total: $${total.toFixed(2)}</strong></h3>

        <p>Si tenés alguna consulta, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo de Colchones Premium</p>
    `;

    try {
        await enviarEmail({
            destinatario: cliente.email,
            asunto: 'Tu Presupuesto de Colchones Premium',
            cuerpoHtml: cuerpoHtml
        });
        res.status(200).json({ message: 'Presupuesto enviado exitosamente por email.' });
    } catch (error) {
        res.status(500).json({ error: 'Hubo un problema al enviar el email.' });
    }
});

// =================== ENDPOINTS ADICIONALES PARA DEBUGGING ===================

// Endpoint para forzar re-migración (PARA DEBUGGING)
app.get('/api/admin/migrate', async (req, res) => {
    try {
        console.log('🔄 Migración forzada solicitada...');
        await migrateExcelDataToMongoDB();
        
        const stats = {
            totalProductos: await Product.countDocuments(),
            productosVisibles: await Product.countDocuments({ mostrar: 'si' }),
            categorias: await Product.distinct('categoria', { mostrar: 'si' })
        };
        
        res.json({
            message: 'Migración completada',
            stats: stats
        });
    } catch (error) {
        console.error('Error en migración forzada:', error);
        res.status(500).json({ error: 'Error en la migración' });
    }
});

// Endpoint para ver todos los productos (PARA DEBUGGING)
app.get('/api/admin/productos/todos', async (req, res) => {
    try {
        const productos = await Product.find({}).sort({ categoria: 1, nombre: 1 });
        
        const stats = {
            total: productos.length,
            visibles: productos.filter(p => p.mostrar === 'si').length,
            ocultos: productos.filter(p => p.mostrar !== 'si').length,
            categorias: [...new Set(productos.map(p => p.categoria))],
            porCategoria: {}
        };
        
        // Contar productos por categoría
        productos.forEach(p => {
            stats.porCategoria[p.categoria] = (stats.porCategoria[p.categoria] || 0) + 1;
        });
        
        res.json({
            productos: productos,
            estadisticas: stats
        });
    } catch (err) {
        console.error('Error al obtener todos los productos:', err);
        res.status(500).json({ error: 'Error al cargar productos' });
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
    console.log(`- GET /api/admin/migrate (debugging)`);
    console.log(`- GET /api/admin/productos/todos (debugging)`);
});