import { useState } from 'react';
import { ShoppingCart, User, Menu, X, UserCog } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export const Header = ({ onOpenVendedorModal, onOpenAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { isAuthenticated, user, logout } = useAuthStore();

  const cartCount = getTotalItems();

  return (
    <header className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="https://res.cloudinary.com/dlshym1te/image/upload/f_auto,q_auto/Alumine%CC%81_Hogar-logo"
              alt="Aluminé Hogar"
              className="h-12 md:h-16 w-auto"
              onError={(e) => {
                e.target.src = '/assets/logo.png';
              }}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#inicio"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Inicio
            </a>
            <a
              href="#productos"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Productos
            </a>
            <a
              href="#contacto"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Contacto
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Acceso Vendedores */}
            <button
              className="hidden md:flex items-center space-x-2 text-white hover:text-purple-200 transition-colors"
              onClick={onOpenVendedorModal}
              title="Acceso Vendedores"
            >
              <UserCog className="w-6 h-6" />
              <span className="text-sm font-medium">Vendedores</span>
            </button>

            {/* User Account */}
            <button
              className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors"
              onClick={onOpenAuthModal}
              title={isAuthenticated ? 'Mi cuenta' : 'Iniciar sesión'}
            >
              <User className="w-6 h-6" />
              {isAuthenticated && (
                <span className="hidden md:inline text-sm">{user?.email}</span>
              )}
            </button>

            {/* Cart */}
            <button
              className="relative flex items-center space-x-2 text-white hover:text-purple-200 transition-colors"
              onClick={() => {
                // TODO: Abrir modal de carrito
              }}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3 border-t border-purple-600 pt-4">
            <a
              href="#inicio"
              className="block text-white hover:text-purple-200 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </a>
            <a
              href="#productos"
              className="block text-white hover:text-purple-200 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Productos
            </a>
            <a
              href="#contacto"
              className="block text-white hover:text-purple-200 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </a>
            <button
              onClick={() => {
                onOpenVendedorModal();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left text-white hover:text-purple-200 transition-colors font-medium"
            >
              Acceso Vendedores
            </button>
            {isAuthenticated && (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-pink-300 hover:text-pink-200 transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
