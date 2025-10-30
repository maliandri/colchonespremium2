import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: {},

      // Agregar producto al carrito
      addToCart: (product) => {
        set((state) => {
          const cart = { ...state.cart };
          if (cart[product._id]) {
            cart[product._id].cantidad += 1;
          } else {
            cart[product._id] = {
              ...product,
              cantidad: 1,
            };
          }
          return { cart };
        });
      },

      // Remover producto del carrito
      removeFromCart: (productId) => {
        set((state) => {
          const cart = { ...state.cart };
          delete cart[productId];
          return { cart };
        });
      },

      // Actualizar cantidad de un producto
      updateQuantity: (productId, cantidad) => {
        set((state) => {
          const cart = { ...state.cart };
          if (cart[productId]) {
            if (cantidad <= 0) {
              delete cart[productId];
            } else {
              cart[productId].cantidad = cantidad;
            }
          }
          return { cart };
        });
      },

      // Vaciar carrito
      clearCart: () => set({ cart: {} }),

      // Obtener cantidad total de productos
      getTotalItems: () => {
        const cart = get().cart;
        return Object.values(cart).reduce((total, item) => total + item.cantidad, 0);
      },

      // Obtener precio total
      getTotalPrice: () => {
        const cart = get().cart;
        return Object.values(cart).reduce(
          (total, item) => total + item.precio * item.cantidad,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Provider opcional si quisieras usar Context API
export const CartProvider = ({ children }) => children;
