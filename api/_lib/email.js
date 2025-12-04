import nodemailer from 'nodemailer';

// Función para decodificar la contraseña si viene codificada
const decodePassword = (pass) => {
  if (!pass) return '';
  // Si la contraseña está en base64 o URL encoded, decodificarla
  try {
    // Intentar decodificar URL encoding primero
    const decoded = decodeURIComponent(pass);
    return decoded;
  } catch (e) {
    // Si falla, usar la contraseña tal cual
    return pass;
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: decodePassword(process.env.EMAIL_PASS)
  },
  // Agregar estas opciones para manejar mejor la autenticación
  authMethod: 'PLAIN',
  tls: {
    rejectUnauthorized: false
  }
});

export async function enviarEmail({ destinatario, asunto, cuerpoHtml }) {
  try {
    const info = await transporter.sendMail({
      from: `"Aluminé Hogar" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: cuerpoHtml
    });

    console.log('✅ Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}