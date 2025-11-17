import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  imagen: { type: String },
  cloudinaryPublicId: { type: String }, // ID público de Cloudinary para las imágenes
  mostrar: { type: String },
  especificaciones: { type: String }
}, { strict: false }); // strict: false permite campos adicionales

// Eliminar modelo cacheado en desarrollo
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema);