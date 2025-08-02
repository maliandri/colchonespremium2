const mongoose = require('mongoose');
const VentaSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fecha: { type: Date, default: Date.now },
    productos: [
        {
            nombre: String,
            cantidad: Number,
            precioUnitario: Number
        }
    ],
    total: Number,
    estado: { type: String, enum: ['presupuesto', 'venta'], default: 'presupuesto' }
});
module.exports = mongoose.model('Venta', VentaSchema);