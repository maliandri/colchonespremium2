import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  imagen: { type: String },
  cloudinaryPublicId: { type: String },
  mostrar: { type: String },
  especificaciones: { type: String }
}, { strict: false });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
