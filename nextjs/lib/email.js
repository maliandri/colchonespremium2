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

export function emailBienvenida(nombre) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c25 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Alumine Hogar</h1>
        <p style="color: #d4e8c2; margin: 8px 0 0; font-size: 14px;">Calidad para tu hogar, precios para vos</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2d5016; margin-top: 0;">Bienvenido/a${nombre ? `, ${nombre}` : ''}!</h2>
        <p style="color: #333; line-height: 1.6;">Gracias por registrarte en <strong>Alumine Hogar</strong>. Ya podes explorar nuestro catalogo de productos y realizar tus compras.</p>
        <div style="background: #f0f7e6; border-left: 4px solid #4a7c25; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #333;">Con tu cuenta podes:</p>
          <ul style="color: #555; margin: 10px 0 0; padding-left: 20px;">
            <li>Agregar productos al carrito</li>
            <li>Realizar pedidos</li>
            <li>Consultar por WhatsApp directo</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://aluminehogar.com.ar" style="background: #4a7c25; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver productos</a>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;">Alumine Hogar - Neuquen, Argentina</p>
        <p style="margin: 5px 0 0;">+54 9 299 576-9999 | aluminehogar@gmail.com</p>
      </div>
    </div>
  `;
}

export function emailRecupero(codigo) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c25 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Alumine Hogar</h1>
        <p style="color: #d4e8c2; margin: 8px 0 0; font-size: 14px;">Recupero de contrasena</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #2d5016; margin-top: 0;">Tu codigo de recupero</h2>
        <p style="color: #333; line-height: 1.6;">Recibimos una solicitud para restablecer tu contrasena. Usa el siguiente codigo:</p>
        <div style="background: #f0f7e6; border: 2px dashed #4a7c25; padding: 20px; margin: 25px 0; border-radius: 8px; text-align: center;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2d5016;">${codigo}</span>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center;">Este codigo expira en <strong>15 minutos</strong>.</p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #664d03; font-size: 13px;">Si no solicitaste este cambio, podes ignorar este email. Tu contrasena no sera modificada.</p>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888;">
        <p style="margin: 0;">Alumine Hogar - Neuquen, Argentina</p>
        <p style="margin: 5px 0 0;">+54 9 299 576-9999 | aluminehogar@gmail.com</p>
      </div>
    </div>
  `;
}

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
