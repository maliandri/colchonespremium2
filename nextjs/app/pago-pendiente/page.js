'use client';

import Link from 'next/link';

export default function PagoPendiente() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago Pendiente</h1>
        <p className="text-gray-600 mb-6">Tu pago esta siendo procesado. Te notificaremos cuando se confirme.</p>
        <Link href="/" className="btn-primary inline-block">Volver al inicio</Link>
      </div>
    </div>
  );
}
