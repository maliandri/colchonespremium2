import nodemailer from 'nodemailer';

const decodePassword = (pass) => {
  if (!pass) return '';
  try {
    if (/^[A-Za-z0-9+/]+=*$/.test(pass) && pass.length >= 16) {
      return Buffer.from(pass, 'base64').toString('utf-8');
    }
    if (pass.includes('%')) {
      return decodeURIComponent(pass);
    }
    return pass;
  } catch (e) {
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
  authMethod: 'LOGIN',
  tls: {
    rejectUnauthorized: false
  }
});

export async function enviarEmail({ destinatario, asunto, cuerpoHtml }) {
  try {
    const info = await transporter.sendMail({
      from: `"Alumine Hogar" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: cuerpoHtml
    });
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}
