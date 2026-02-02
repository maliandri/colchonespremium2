import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, comparePassword } from '@/lib/auth-helpers';
import { enviarEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const { action, email, password, nombre, telefono } = await request.json();

    if (!action || !email || !password) {
      return NextResponse.json({ error: 'Accion, email y contrasena son requeridos' }, { status: 400 });
    }

    // LOGIN
    if (action === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: 'Email o contrasena incorrectos' }, { status: 401 });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Email o contrasena incorrectos' }, { status: 401 });
      }

      const token = generateToken(user._id, user.email, user.role);

      return NextResponse.json({
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
    }

    // REGISTER
    if (action === 'register') {
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contrasena debe tener al menos 6 caracteres' }, { status: 400 });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email invalido' }, { status: 400 });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'Este email ya esta registrado' }, { status: 400 });
      }

      const newUser = new User({
        email: email.toLowerCase(),
        password,
        nombre: nombre || '',
        telefono: telefono || '',
        role: 'customer'
      });
      await newUser.save();

      const token = generateToken(newUser._id, newUser.email, newUser.role);

      // Enviar correo de bienvenida (sin bloquear)
      enviarEmail({
        destinatario: email,
        asunto: 'Bienvenido/a a Alumine Hogar!',
        cuerpoHtml: `
          <html><body>
            <div style="max-width:600px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:8px;">
              <div style="text-align:center;border-bottom:1px solid #eee;padding-bottom:15px;margin-bottom:15px;">
                <h2>Gracias por unirte a Alumine Hogar!</h2>
                <p>Estas parte de nuestra comunidad. Explora nuestro catalogo.</p>
                <p>Saludos, El equipo de Alumine Hogar</p>
              </div>
            </div>
          </body></html>
        `
      }).catch(err => console.error('Error al enviar email de bienvenida:', err));

      return NextResponse.json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          nombre: newUser.nombre,
          role: newUser.role
        }
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Accion invalida. Usa "login" o "register".' }, { status: 400 });

  } catch (error) {
    console.error('Error en autenticacion:', error);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}
