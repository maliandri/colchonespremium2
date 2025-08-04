import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configurar el "transporter" de Nodemailer
//    Usa los datos de tu archivo .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true para el puerto 465, false para otros
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 2. Crear una función reutilizable para enviar correos
export async function enviarEmail({ destinatario, asunto, cuerpoHtml }) {
    try {
        const info = await transporter.sendMail({
            from: `"Colchones Premium" <${process.env.EMAIL_USER}>`, // Nombre y dirección del remitente
            to: destinatario,
            subject: asunto,
            html: cuerpoHtml,
        });

        console.log("Correo enviado exitosamente:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw new Error('Error al enviar el correo.');
    }
}