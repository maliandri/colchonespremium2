import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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