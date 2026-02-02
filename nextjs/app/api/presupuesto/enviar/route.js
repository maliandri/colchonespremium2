import { NextResponse } from 'next/server';
import { enviarEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { cliente, vendedor, productos, total } = await request.json();

    if (!cliente || !cliente.email) {
      return NextResponse.json({ error: 'Falta el email del cliente.' }, { status: 400 });
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un producto.' }, { status: 400 });
    }

    if (!total || typeof total !== 'number') {
      return NextResponse.json({ error: 'El total es requerido.' }, { status: 400 });
    }

    const cuerpoHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
            .product-list { list-style: none; padding: 0; }
            .product-item { padding: 10px; border-bottom: 1px solid #eee; }
            .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Presupuesto - Alumine Hogar</h1>
            </div>
            <p>Hola <strong>${cliente.nombre || cliente.email}</strong>,</p>
            <p>Gracias por tu interes. A continuacion, te enviamos el presupuesto solicitado${vendedor?.nombre ? ` por nuestro vendedor <strong>${vendedor.nombre}</strong>` : ''}.</p>

            <h3>Detalle del Pedido:</h3>
            <ul class="product-list">
              ${productos.map(p => `
                <li class="product-item">
                  <strong>${p.cantidad} x ${p.nombre}</strong><br>
                  Precio unitario: $${p.precioUnitario?.toFixed(2) || '0.00'}<br>
                  Subtotal: $${p.subtotal?.toFixed(2) || '0.00'}
                </li>
              `).join('')}
            </ul>

            <div class="total">
              Total: $${total.toFixed(2)}
            </div>

            <p style="margin-top: 30px;">Si tenes alguna consulta, no dudes en contactarnos.</p>
            <p>Saludos,<br><strong>El equipo de Alumine Hogar</strong></p>
          </div>
        </body>
      </html>
    `;

    await enviarEmail({
      destinatario: cliente.email,
      asunto: 'Tu Presupuesto de Alumine Hogar',
      cuerpoHtml
    });

    return NextResponse.json({ message: 'Presupuesto enviado exitosamente por email.' });
  } catch (error) {
    console.error('Error al enviar el presupuesto:', error);
    return NextResponse.json({ error: 'Hubo un problema al enviar el email.', details: error.message }, { status: 500 });
  }
}
