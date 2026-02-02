'use client';

import { useState, createContext, useContext } from 'react';
import { CartModal } from '@/components/CartModal';
import { AuthModal } from '@/components/AuthModal';
import { StoreHydration } from '@/components/StoreHydration';

const UIContext = createContext();

export function useUI() {
  return useContext(UIContext);
}

export function ClientProviders({ children }) {
  const [showVendedorModal, setShowVendedorModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  return (
    <UIContext.Provider value={{
      showVendedorModal, setShowVendedorModal,
      showAuthModal, setShowAuthModal,
      showCartModal, setShowCartModal,
    }}>
      <StoreHydration />
      {children}
      <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </UIContext.Provider>
  );
}
