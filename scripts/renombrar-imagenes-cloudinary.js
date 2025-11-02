/**
 * Script para renombrar imágenes en Cloudinary
 * De: alumine/alumine/colchon/col-001
 * A: alumine/Colchón Clásico Banda Mt 0.80x0.18 Inducol 1 UN
 * 
 * Ejecutar: node scripts/renombrar-imagenes-cloudinary.js
 */

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlshym1te',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Schema de Product
const ProductSchema = new mongoose.Schema({
  _id: String,
  nombre: String,
  descripcion: String,
  precio: Number,
  categoria: String,
  imagen: String,
  cloudinaryPublicId: String,
  mostrar: String
});

const Product = mongoose.model('Product', ProductSchema);

async function renombrarImagenes() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener productos con cloudinaryPublicId
    const productos = await Product.find({ 
      cloudinaryPublicId: { $exists: true, $ne: '' } 
    });

    console.log(\`📋 Total de productos con imágenes: \${productos.length}\n\`);

    let exitosos = 0;
    let errores = 0;
    let omitidos = 0;

    for (const producto of productos) {
      const oldPublicId = producto.cloudinaryPublicId;
      const newPublicId = \`alumine/\${producto.nombre}\`;

      // Verificar si ya tiene el nuevo formato
      if (oldPublicId === newPublicId) {
        console.log(\`⏭️  Omitido: \${producto.nombre} (ya tiene el formato correcto)\`);
        omitidos++;
        continue;
      }

      try {
        console.log(\`🔄 Renombrando: \${producto._id}\`);
        console.log(\`   De: \${oldPublicId}\`);
        console.log(\`   A:  \${newPublicId}\`);

        // Renombrar en Cloudinary
        await cloudinary.uploader.rename(
          oldPublicId,
          newPublicId,
          { 
            overwrite: false, 
            invalidate: true 
          }
        );

        // Actualizar en MongoDB
        producto.cloudinaryPublicId = newPublicId;
        await producto.save();

        console.log(\`   ✅ Exitoso\n\`);
        exitosos++;

      } catch (error) {
        console.log(\`   ❌ Error: \${error.message}\n\`);
        errores++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(\`   ✅ Exitosos: \${exitosos}\`);
    console.log(\`   ❌ Errores: \${errores}\`);
    console.log(\`   ⏭️  Omitidos: \${omitidos}\`);
    console.log(\`   📋 Total: \${productos.length}\`);

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
renombrarImagenes();
