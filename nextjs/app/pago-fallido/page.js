'use client';

import Link from 'next/link';

export default function PagoFallido() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago Fallido</h1>
        <p className="text-gray-600 mb-6">Hubo un problema al procesar tu pago. Por favor intenta nuevamente.</p>
        <Link href="/" className="btn-primary inline-block">Volver al inicio</Link>
      </div>
    </div>
  );
}
