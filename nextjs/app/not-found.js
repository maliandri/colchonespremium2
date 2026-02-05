import Link from 'next/link';

export const metadata = {
  title: 'Pagina no encontrada',
  description: 'La pagina que buscas no existe. Visita nuestra tienda de colchones y almohadas en Alumine Hogar.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagina no encontrada</h2>
        <p className="text-gray-600 mb-6">
          Lo sentimos, la pagina que buscas no existe o fue movida.
          Puede que el producto ya no este disponible o la URL haya cambiado.
        </p>
        <div className="space-y-3">
          <Link href="/" className="btn-primary inline-block w-full">
            Ver todos los productos
          </Link>
          <Link href="/bot" className="block text-primary hover:underline">
            Chatea con Alumine Bot para encontrar lo que buscas
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          Si crees que esto es un error, contactanos por WhatsApp.
        </p>
      </div>
    </div>
  );
}
