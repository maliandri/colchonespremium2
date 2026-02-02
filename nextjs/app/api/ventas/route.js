import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Venta from '@/lib/models/Venta';
import { extractTokenFromHeaders, verifyToken } from '@/lib/auth-helpers';

function authenticateUser(request) {
  const token = extractTokenFromHeaders(request.headers);
  if (!token) throw new Error('Token no proporcionado');
  return verifyToken(token);
}

export async function GET(request) {
  try {
    const decoded = authenticateUser(request);
    await connectDB();

    const historial = await Venta.find({ userId: decoded.userId }).sort({ fecha: -1 });

    return NextResponse.json(historial);
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('proporcionado')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = authenticateUser(request);
    await connectDB();

    const { productos, total, estado } = await request.json();

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un producto' }, { status: 400 });
    }

    if (!total || typeof total !== 'number') {
      return NextResponse.json({ error: 'El total es requerido y debe ser un numero' }, { status: 400 });
    }

    const newVenta = new Venta({
      userId: decoded.userId,
      productos,
      total,
      estado: estado || 'presupuesto'
    });

    await newVenta.save();

    return NextResponse.json({
      message: 'Venta registrada exitosamente.',
      venta: newVenta
    }, { status: 201 });
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('proporcionado')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
