import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dlshym1te',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('Conectado a MongoDB\n');

    const productos = await Product.find({
      cloudinaryPublicId: { $exists: true, $ne: '' }
    });

    console.log(`Total de productos con imagenes: ${productos.length}\n`);

    let exitosos = 0;
    let errores = 0;
    let omitidos = 0;

    for (const producto of productos) {
      const oldPublicId = producto.cloudinaryPublicId;
      const newPublicId = `alumine/${producto.nombre}`;

      if (oldPublicId === newPublicId) {
        console.log(`Omitido: ${producto.nombre}`);
        omitidos++;
        continue;
      }

      try {
        console.log(`Renombrando: ${producto._id}`);
        console.log(`   De: ${oldPublicId}`);
        console.log(`   A:  ${newPublicId}`);

        await cloudinary.uploader.rename(oldPublicId, newPublicId, {
          overwrite: false,
          invalidate: true
        });

        producto.cloudinaryPublicId = newPublicId;
        await producto.save();

        console.log(`   Exitoso\n`);
        exitosos++;

      } catch (error) {
        console.log(`   Error: ${error.message}\n`);
        errores++;
      }
    }

    console.log('\nResumen:');
    console.log(`   Exitosos: ${exitosos}`);
    console.log(`   Errores: ${errores}`);
    console.log(`   Omitidos: ${omitidos}`);
    console.log(`   Total: ${productos.length}`);

  } catch (error) {
    console.error('Error fatal:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDesconectado de MongoDB');
  }
}

renombrarImagenes();
