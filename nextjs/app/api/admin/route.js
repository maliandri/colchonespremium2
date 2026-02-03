import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import Conversation from '@/lib/models/Conversation';
import { extractTokenFromHeaders, verifyToken, requireAdmin } from '@/lib/auth-helpers';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryUrl, IMG_THUMB, IMG_CARD } from '@/lib/cloudinary';
import { MAPEO_NOMBRES_CLOUDINARY } from '@/lib/cloudinary-mapeo-nombres';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function authenticateAdmin(request) {
  const token = extractTokenFromHeaders(request.headers);
  if (!token) throw new Error('Token de autenticacion requerido');
  const decoded = verifyToken(token);
  requireAdmin(decoded);
  return decoded;
}

export async function GET(request) {
  try {
    const decoded = authenticateAdmin(request);
    await connectDB();

    const action = request.nextUrl.searchParams.get('action');

    // LIST CONVERSATIONS
    if (action === 'conversations') {
      const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
      const limit = 20;
      const dateFrom = request.nextUrl.searchParams.get('dateFrom');
      const dateTo = request.nextUrl.searchParams.get('dateTo');
      const status = request.nextUrl.searchParams.get('status');

      const query = {};
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
      if (status) query.status = status;

      const [conversations, total] = await Promise.all([
        Conversation.find(query)
          .select('sessionId userInfo status leadCaptured messageCount createdAt lastMessageAt')
          .sort({ lastMessageAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Conversation.countDocuments(query)
      ]);

      return NextResponse.json({
        success: true,
        conversations,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    }

    // GET SINGLE CONVERSATION
    if (action === 'conversation') {
      const id = request.nextUrl.searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'ID de conversacion requerido' }, { status: 400 });
      }
      const conversation = await Conversation.findById(id).lean();
      if (!conversation) {
        return NextResponse.json({ error: 'Conversacion no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ success: true, conversation });
    }

    // DEFAULT: LIST PRODUCTS
    const productosRaw = await Product.find({}).sort({ createdAt: -1 }).lean();

    // Transformar productos con imagenes de Cloudinary (igual que la pagina publica)
    const productos = productosRaw.map((p) => {
      const cloudinaryPath = MAPEO_NOMBRES_CLOUDINARY[p.nombre] || p.cloudinaryPublicId || null;

      return {
        ...p,
        _id: p._id.toString(),
        imagenOptimizada: cloudinaryPath
          ? {
              thumb: getCloudinaryUrl(cloudinaryPath, IMG_THUMB),
              card: getCloudinaryUrl(cloudinaryPath, IMG_CARD),
            }
          : (p.imagenOptimizada || p.imagen || ''),
      };
    });

    return NextResponse.json({ success: true, productos, total: productos.length });
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('administrador')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = authenticateAdmin(request);
    const action = request.nextUrl.searchParams.get('action');

    // UPLOAD IMAGE
    if (action === 'upload') {
      const { image } = await request.json();
      if (!image) {
        return NextResponse.json({ error: 'Imagen requerida' }, { status: 400 });
      }

      const result = await cloudinary.uploader.upload(image, {
        folder: 'colchones-premium',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      const optimizedUrl = cloudinary.url(result.public_id, {
        width: 400, height: 400, crop: 'limit', quality: 'auto', fetch_format: 'auto'
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        optimizedUrl,
        publicId: result.public_id
      });
    }

    // CREATE PRODUCT
    await connectDB();
    const { nombre, descripcion, precio, categoria, medidas, imagen, imagenOptimizada, mostrar, stock } = await request.json();

    if (!nombre || !precio || !categoria) {
      return NextResponse.json({ error: 'Nombre, precio y categoria son requeridos' }, { status: 400 });
    }

    const nuevoProducto = new Product({
      nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      categoria,
      medidas: medidas || '',
      imagen: imagen || '',
      imagenOptimizada: imagenOptimizada || '',
      mostrar: mostrar || 'si',
      stock: stock || 0
    });

    await nuevoProducto.save();

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      producto: nuevoProducto
    }, { status: 201 });

  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('administrador')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const decoded = authenticateAdmin(request);
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    await connectDB();
    const updates = await request.json();
    delete updates._id;

    const productoActualizado = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!productoActualizado) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('administrador')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const decoded = authenticateAdmin(request);
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    await connectDB();
    const productoEliminado = await Product.findByIdAndDelete(id);

    if (!productoEliminado) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    if (error.message.includes('Token') || error.message.includes('administrador')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
