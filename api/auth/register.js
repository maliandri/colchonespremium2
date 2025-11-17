import { connectDB } from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth.js';
import { enviarEmail } from '../_lib/email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    const token = generateToken(newUser._id);

    // Enviar correo de bienvenida (sin bloquear la respuesta)
    const asunto = '¡Bienvenido/a a Alumine Hogar!';
    const cuerpoHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
            .header img { max-width: 250px; }
            .content { padding: 20px; text-align: center; }
            .button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #ff2600; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
            <img src="https://aluminehogar.com.ar/assets/logo.png" alt="Aluminé Hogar Logo">
            <h2>¡Gracias por unirte a Aluminé Hogar!</h2>
            <p>Estamos encantados de tenerte con nosotros. Ahora eres parte de nuestra comunidad y tienes acceso a la mejor selección de productos para tu hogar.</p>
            <p>Explora nuestro catálogo y encuentra lo que necesitas para tu hogar.</p>
            <p>Saludos,<br>El equipo de Aluminé Hogar</p>
            </div>
          </div>
        </body>
      </html>
    `;

    enviarEmail({
      destinatario: email,
      asunto: asunto,
      cuerpoHtml: cuerpoHtml
    }).catch(err => console.error('Error al enviar email de bienvenida:', err));

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token: token,
      user: { id: newUser._id, email: newUser.email }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
}