/**
 * API de Registro de Usuarios
 */
import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth-helpers.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { email, password, nombre, telefono } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    await connectDB();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Crear nuevo usuario
    const user = new User({
      email: email.toLowerCase(),
      password, // El hash se hace automáticamente en el pre-save hook
      nombre: nombre || '',
      telefono: telefono || '',
      role: 'customer' // Por defecto customer
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id, user.email, user.role);

    console.log(`✅ Usuario registrado: ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
}
