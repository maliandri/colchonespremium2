import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  try {
    await connectDB();

    let attempts = 0;
    while ((!Product.db || Product.db.readyState !== 1) && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    if (!Product.db || Product.db.readyState !== 1) {
      throw new Error('MongoDB no se conecto despues de varios intentos');
    }

    const db = Product.db;
    const collection = db.collection('productos');
    const categorias = await collection.distinct('categoria', { mostrar: 'si' });

    return NextResponse.json(categorias);
  } catch (err) {
    console.error('Error al obtener categorias:', err);
    return NextResponse.json({ error: 'Error al cargar categorias', details: err.message }, { status: 500 });
  }
}
