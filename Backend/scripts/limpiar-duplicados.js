import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la carpeta Backend
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Modelo de productos (schema flexible para leer todos los campos)
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function limpiarDuplicados() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(process.env.DB_URI);
        console.log('✅ Conectado a MongoDB');

        console.log('\n🔍 Buscando productos duplicados...');

        // Obtener todos los productos
        const todosLosProductos = await Product.find({}).sort({ nombre: 1 });
        console.log(`📊 Total de productos en BD: ${todosLosProductos.length}`);

        // Agrupar por nombre
        const productosPorNombre = {};
        todosLosProductos.forEach(producto => {
            if (!productosPorNombre[producto.nombre]) {
                productosPorNombre[producto.nombre] = [];
            }
            productosPorNombre[producto.nombre].push(producto);
        });

        // Encontrar duplicados
        const nombresDuplicados = Object.keys(productosPorNombre).filter(
            nombre => productosPorNombre[nombre].length > 1
        );

        console.log(`\n🔍 Productos con duplicados: ${nombresDuplicados.length}`);

        let eliminados = 0;
        let mantenidos = 0;

        // Para cada grupo de duplicados
        for (const nombre of nombresDuplicados) {
            const duplicados = productosPorNombre[nombre];
            console.log(`\n📦 Procesando: ${nombre} (${duplicados.length} copias)`);

            // Ordenar: primero los que TIENEN imagen, luego los que NO
            duplicados.sort((a, b) => {
                const aHasImage = a.imagen && a.imagen !== '';
                const bHasImage = b.imagen && b.imagen !== '';

                if (aHasImage && !bHasImage) return -1;
                if (!aHasImage && bHasImage) return 1;
                return 0;
            });

            // Mantener el primero (que debería tener imagen si existe)
            const mantener = duplicados[0];
            const eliminar = duplicados.slice(1);

            console.log(`  ✅ Mantener: ${mantener._id} (imagen: ${mantener.imagen ? 'SÍ' : 'NO'})`);

            // Eliminar los demás
            for (const dup of eliminar) {
                console.log(`  ❌ Eliminar: ${dup._id} (imagen: ${dup.imagen ? 'SÍ' : 'NO'})`);
                await Product.deleteOne({ _id: dup._id });
                eliminados++;
            }

            mantenidos++;
        }

        console.log(`\n📈 Resumen:`);
        console.log(`  ✅ Productos únicos mantenidos: ${mantenidos}`);
        console.log(`  ❌ Duplicados eliminados: ${eliminados}`);

        // Verificar resultado final
        const finalCount = await Product.countDocuments();
        console.log(`\n📊 Total de productos después de limpieza: ${finalCount}`);

        console.log('\n✨ Limpieza completada exitosamente!');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

limpiarDuplicados();
