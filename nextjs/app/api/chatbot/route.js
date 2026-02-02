import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/gemini';
import { searchProducts } from '@/lib/product-search';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_MAIL_USER,
    pass: process.env.ZOHO_MAIL_PASS ? Buffer.from(process.env.ZOHO_MAIL_PASS, 'base64').toString('utf-8') : ''
  }
});

export async function POST(request) {
  const action = request.nextUrl.searchParams.get('action');

  try {
    // CONVERSATION
    if (action === 'conversation' || !action) {
      const { message, history, sessionId } = await request.json();

      if (!message || typeof message !== 'string') {
        return NextResponse.json({ error: 'El campo "message" es requerido y debe ser un string' }, { status: 400 });
      }

      // Search for relevant products to provide context
      const productos = await searchProducts(message);

      const response = await generateAIResponse(message, productos, history || []);

      return NextResponse.json({
        reply: response,
        productos: productos
      });
    }

    // LEAD
    if (action === 'lead') {
      const { leadData, conversationSummary, sessionId } = await request.json();

      if (!leadData || !leadData.email) {
        return NextResponse.json({ error: 'leadData con email es requerido' }, { status: 400 });
      }

      const conversacionTexto = conversationSummary && Array.isArray(conversationSummary)
        ? conversationSummary.map(msg => `${msg.role === 'user' ? 'Cliente' : 'Bot'}: ${msg.content}`).join('\n')
        : 'Sin conversacion disponible';

      await transporter.sendMail({
        from: `"Alumine Hogar" <${process.env.ZOHO_MAIL_USER}>`,
        to: leadData.email,
        subject: 'Gracias por tu interes - Alumine Hogar',
        html: `
          <h2>Gracias por tu interes en Alumine Hogar!</h2>
          <p>Hola ${leadData.nombre || 'Cliente'},</p>
          <p>Hemos recibido tu consulta y un especialista se pondra en contacto contigo pronto.</p>
          <p>Gracias por confiar en nosotros!</p>
        `
      });

      await transporter.sendMail({
        from: `"Alumine Hogar" <${process.env.ZOHO_MAIL_USER}>`,
        to: process.env.ZOHO_MAIL_USER,
        subject: `Nuevo Lead: ${leadData.nombre || leadData.email}`,
        html: `
          <h2>Nuevo Lead Capturado</h2>
          <ul>
            <li><strong>Nombre:</strong> ${leadData.nombre || 'No proporcionado'}</li>
            <li><strong>Email:</strong> ${leadData.email}</li>
            <li><strong>Telefono:</strong> ${leadData.telefono || 'No proporcionado'}</li>
            <li><strong>Interes:</strong> ${leadData.interes || 'No especificado'}</li>
            <li><strong>Session:</strong> ${sessionId || 'N/A'}</li>
          </ul>
          <h3>Conversacion:</h3>
          <pre style="background:#f4f4f4;padding:10px;border-radius:5px;white-space:pre-wrap;">${conversacionTexto}</pre>
        `
      });

      return NextResponse.json({ success: true, message: 'Lead enviado exitosamente' });
    }

    return NextResponse.json({ error: 'Accion no valida' }, { status: 400 });

  } catch (error) {
    console.error('Error en chatbot:', error);
    return NextResponse.json({ error: 'Error en el servidor', details: error.message }, { status: 500 });
  }
}
