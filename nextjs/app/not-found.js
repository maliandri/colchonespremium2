import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pagina no encontrada</h2>
        <p className="text-gray-600 mb-8">La pagina que buscas no existe o fue movida.</p>
        <Link href="/" className="btn-primary inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
