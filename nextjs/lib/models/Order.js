import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productos: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nombre: String,
    precio: Number,
    quantity: Number,
    imagen: String
  }],
  total: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_process', 'cancelled'],
    default: 'pending'
  },
  mercadoPagoId: String,
  externalReference: String,
  paymentMethod: String,
  payer: {
    nombre: String,
    email: String,
    telefono: String
  },
  shippingAddress: {
    calle: String,
    numero: String,
    piso: String,
    depto: String,
    codigoPostal: String,
    ciudad: String,
    provincia: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
