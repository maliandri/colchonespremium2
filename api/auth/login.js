/**
 * API de Login de Usuarios
 */
import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken, comparePassword } from '../_lib/auth-helpers.js';

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
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    await connectDB();

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generar token
    const token = generateToken(user._id, user.email, user.role);

    console.log(`✅ Login exitoso: ${email} (${user.role})`);

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}
