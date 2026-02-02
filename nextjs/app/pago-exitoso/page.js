'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function PagoExitoso() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">Tu compra fue procesada correctamente. Te enviaremos un email con los detalles.</p>
        <Link href="/" className="btn-primary inline-block">Volver al inicio</Link>
      </div>
    </div>
  );
}
