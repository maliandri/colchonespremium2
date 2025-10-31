import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const token = generateToken(user._id);
    
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
}