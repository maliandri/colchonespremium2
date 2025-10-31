import mongoose from 'mongoose';

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

export default mongoose.models.Venta || mongoose.model('Venta', VentaSchema);