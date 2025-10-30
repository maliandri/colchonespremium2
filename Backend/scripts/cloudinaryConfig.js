import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// =================== CONFIGURACIÓN DE CLOUDINARY ===================
const CLOUD_NAME = 'dlshym1te'; // Tu cloud específico
const FOLDER_NAME = 'alumine';   // Tu carpeta dentro del cloud

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// =================== PRESETS DE OPTIMIZACIÓN ===================

export const IMG_THUMB = {
    width: 150,
    height: 150,
    crop: 'fill',
    quality: 70
};

export const IMG_CARD = {
    width: 400,
    height: 300,
    crop: 'fit',
    quality: 75
};

export const IMG_DETAIL = {
    width: 1200,
    height: 900,
    crop: 'limit',
    quality: 80
};

export const IMG_MOBILE = {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 75
};

// =================== FUNCIONES DE GENERACIÓN DE URLs ===================

/**
 * Genera URL de Cloudinary con transformaciones
 * @param {string} publicIdOrUrl - Public ID o URL completa de Cloudinary
 * @param {object|number} transformations - Preset o número (ancho)
 * @returns {string} URL optimizada
 */
export const getCloudinaryUrl = (publicIdOrUrl, transformations = IMG_CARD) => {
    if (!publicIdOrUrl) return '';
    
    // Si ya es una URL de Cloudinary completa, extraer el public_id
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.includes('cloudinary.com')) {
        const match = publicIdOrUrl.match(/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        if (match) {
            publicId = match[1];
        }
    }
    
    // Retrocompatibilidad: si recibe un número, solo aplica width
    if (typeof transformations === 'number') {
        return cloudinary.url(publicId, {
            width: transformations,
            quality: 'auto:good',
            fetch_format: 'auto',
            flags: 'progressive'
        });
    }
    
    // Construir transformaciones completas
    const options = {
        quality: 'auto:good',
        fetch_format: 'auto',
        flags: 'progressive'
    };
    
    if (transformations.width) options.width = transformations.width;
    if (transformations.height) options.height = transformations.height;
    if (transformations.crop) options.crop = transformations.crop;
    if (transformations.quality !== undefined) {
        options.quality = transformations.quality;
    }
    
    return cloudinary.url(publicId, options);
};

/**
 * Sube una imagen a Cloudinary desde URL o buffer
 * @param {string|Buffer} file - URL de imagen o buffer
 * @param {string} categoria - Categoría del producto
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>}
 */
export async function subirImagen(file, categoria, productId) {
    try {
        const categoriaSlug = categoria.toLowerCase().replace(/\s+/g, '-');
        const nombreArchivo = productId.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const publicId = `${FOLDER_NAME}/${categoriaSlug}/${nombreArchivo}`;

        const options = {
            public_id: publicId,
            folder: FOLDER_NAME,
            format: 'webp', // Convertir a WebP automáticamente
            transformation: [
                {
                    width: 1200,
                    height: 1200,
                    crop: 'limit',
                    quality: 'auto:good'
                }
            ],
            tags: ['alumine', categoriaSlug],
            overwrite: true, // Sobrescribir si ya existe
            invalidate: true // Invalidar CDN cache
        };

        const result = await cloudinary.uploader.upload(file, options);
        
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };
    } catch (error) {
        console.error('Error al subir imagen a Cloudinary:', error);
        throw new Error('Error al subir la imagen: ' + error.message);
    }
}

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<Object>}
 */
export async function eliminarImagen(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        throw new Error('Error al eliminar la imagen: ' + error.message);
    }
}

/**
 * Migra imágenes desde URLs externas (Imgur, etc.) a Cloudinary
 * @param {Array} productos - Array de productos con URLs de imágenes
 * @returns {Promise<Array>}
 */
export async function migrarImagenesACloudinary(productos) {
    console.log(`🔄 Iniciando migración de ${productos.length} imágenes a Cloudinary...`);
    console.log(`📁 Carpeta destino: ${FOLDER_NAME}\n`);
    
    const productosMigrados = [];
    let exitosas = 0;
    let fallidas = 0;

    for (const producto of productos) {
        try {
            // Si ya está en Cloudinary, saltar
            if (producto.imagen && producto.imagen.includes('res.cloudinary.com')) {
                console.log(`⏭️  ${producto.nombre} - Ya está en Cloudinary`);
                productosMigrados.push(producto);
                continue;
            }

            // Si no tiene imagen, saltar
            if (!producto.imagen || producto.imagen.trim() === '') {
                console.log(`⚠️  ${producto.nombre} - Sin imagen`);
                productosMigrados.push(producto);
                continue;
            }

            console.log(`📤 Subiendo: ${producto.nombre}`);
            console.log(`   Desde: ${producto.imagen.substring(0, 60)}...`);

            // Subir imagen
            const resultado = await subirImagen(
                producto.imagen,
                producto.categoria,
                producto._id
            );

            console.log(`   ✅ Éxito - ${(resultado.bytes / 1024).toFixed(1)} KB`);
            console.log(`   🔗 ${resultado.url}\n`);

            productosMigrados.push({
                ...producto,
                imagen: resultado.url,
                cloudinaryPublicId: resultado.publicId,
                imagenOriginal: producto.imagen // Backup
            });

            exitosas++;
            
            // Pausa para evitar rate limiting (100ms)
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error(`❌ Error al migrar ${producto.nombre}:`, error.message);
            productosMigrados.push(producto); // Mantener URL original
            fallidas++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Resumen de Migración:');
    console.log('='.repeat(50));
    console.log(`✅ Exitosas:  ${exitosas}`);
    console.log(`❌ Fallidas:  ${fallidas}`);
    console.log(`📦 Total:     ${productos.length}`);
    console.log(`📈 Éxito:     ${((exitosas/productos.length)*100).toFixed(1)}%`);
    console.log('='.repeat(50) + '\n');

    return productosMigrados;
}

/**
 * Genera blur placeholder para lazy loading
 * @param {string} publicId - Public ID de la imagen
 * @returns {string}
 */
export const getBlurPlaceholder = (publicId) => {
    if (!publicId) return '';
    return cloudinary.url(publicId, {
        width: 20,
        quality: 20,
        effect: 'blur:1000',
        fetch_format: 'auto'
    });
};

/**
 * Genera URLs responsive con múltiples resoluciones
 * @param {string} publicId - Public ID de la imagen
 * @param {object} baseTransformations - Transformaciones base
 * @returns {object} { src, srcset }
 */
export const getResponsiveImageUrl = (publicId, baseTransformations = IMG_CARD) => {
    if (!publicId) return { src: '', srcset: '' };
    
    const widths = [400, 800, 1200];
    
    const srcset = widths.map(width => {
        const url = cloudinary.url(publicId, {
            ...baseTransformations,
            width,
            quality: 'auto:good',
            fetch_format: 'auto'
        });
        return `${url} ${width}w`;
    }).join(', ');
    
    const src = getCloudinaryUrl(publicId, baseTransformations);
    
    return { src, srcset };
};

// =================== EXPORTACIONES ===================

export default cloudinary;

export {
    CLOUD_NAME,
    FOLDER_NAME
};