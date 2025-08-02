const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Puedes añadir más campos si lo necesitas
});
module.exports = mongoose.model('User', UserSchema);