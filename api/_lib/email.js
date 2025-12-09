import nodemailer from 'nodemailer';

// Función para decodificar la contraseña si viene codificada
const decodePassword = (pass) => {
  if (!pass) return '';

  try {
    // Primero verificar si está en base64
    // Base64 solo contiene A-Z, a-z, 0-9, +, /, =
    if (/^[A-Za-z0-9+/]+=*$/.test(pass) && pass.length >= 16) {
      const decoded = Buffer.from(pass, 'base64').toString('utf-8');
      console.log('🔓 Contraseña decodificada desde Base64');
      return decoded;
    }

    // Si no es base64, intentar URL encoding
    if (pass.includes('%')) {
      const decoded = decodeURIComponent(pass);
      console.log('🔓 Contraseña decodificada desde URL encoding');
      return decoded;
    }

    // Si no tiene encoding, usar tal cual
    console.log('🔑 Usando contraseña sin decodificar');
    return pass;
  } catch (e) {
    console.error('⚠️ Error decodificando contraseña, usando original:', e.message);
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
  // Usar LOGIN en lugar de PLAIN para mejor compatibilidad
  authMethod: 'LOGIN',
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