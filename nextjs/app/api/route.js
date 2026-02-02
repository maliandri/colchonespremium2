import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    api: 'Alumine Hogar API',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/auth',
      '/api/productos',
      '/api/producto/[id]',
      '/api/categorias',
      '/api/admin',
      '/api/mercadopago',
      '/api/chatbot',
      '/api/ventas',
      '/api/presupuesto/enviar'
    ]
  });
}
