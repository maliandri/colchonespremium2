import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Iniciar sesión
      login: async (email, password) => {
        try {
          const data = await apiLogin(email, password);

          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userEmail', email);

          // Decodificar el token para obtener el ID
          const payload = JSON.parse(atob(data.token.split('.')[1]));

          set({
            user: { email, id: payload.id },
            token: data.token,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          console.error('Error en login:', error);
          return {
            success: false,
            error: error.response?.data?.error || 'Error al iniciar sesión',
          };
        }
      },

      // Registrarse
      register: async (email, password) => {
        try {
          const data = await apiRegister(email, password);

          // Después del registro, hacer login automáticamente
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', email);

            const payload = JSON.parse(atob(data.token.split('.')[1]));

            set({
              user: { email, id: payload.id },
              token: data.token,
              isAuthenticated: true,
            });
          }

          return { success: true };
        } catch (error) {
          console.error('Error en registro:', error);
          return {
            success: false,
            error: error.response?.data?.error || 'Error al registrarse',
          };
        }
      },

      // Cerrar sesión
      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Verificar sesión guardada
      checkAuth: () => {
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');

        if (token && email) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Verificar si el token no ha expirado
            if (payload.exp && payload.exp * 1000 > Date.now()) {
              set({
                user: { email, id: payload.id },
                token,
                isAuthenticated: true,
              });
              return true;
            } else {
              // Token expirado
              get().logout();
              return false;
            }
          } catch (error) {
            console.error('Error al verificar token:', error);
            get().logout();
            return false;
          }
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Provider opcional
export const AuthProvider = ({ children }) => children;
