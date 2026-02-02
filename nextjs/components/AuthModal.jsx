'use client';
import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { login, register } from '@/services/api';

export const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  // Cargar credenciales guardadas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPassword = localStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const response = await login(email, password);
        setAuth(response.token, { email });

        // Guardar credenciales si "Recordar" esta activado
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        onClose();
      } else {
        // Register
        if (password !== confirmPassword) {
          setError('Las contrasenas no coinciden');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contrasena debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        const response = await register(email, password);
        setAuth(response.token, { email });

        // Guardar credenciales si "Recordar" esta activado
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        }

        onClose();
      }
    } catch (err) {
      console.error('Error en auth:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setRememberMe(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="gradient-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {isLogin ? 'Iniciar Sesion' : 'Registrarse'}
              </h2>
              <p className="text-purple-100 text-sm">
                {isLogin ? 'Accede a tu cuenta' : 'Crea una nueva cuenta'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password (only for register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required={!isLogin}
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* Remember Me Checkbox (only for login) */}
          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Recordar mi usuario y contrasena
              </label>
            </div>
          )}

          {/* Forgot Password/Email Links (only for login) */}
          {isLogin && (
            <div className="flex flex-col space-y-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  const savedEmail = localStorage.getItem('savedEmail');
                  if (savedEmail) {
                    alert(`Tu usuario guardado es: ${savedEmail}`);
                    setEmail(savedEmail);
                  } else {
                    alert('No hay usuarios guardados en este navegador. Activa "Recordar mi usuario" al iniciar sesion.');
                  }
                }}
                className="text-primary hover:text-accent transition-colors flex items-center gap-1 justify-start"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Olvidaste tu usuario?</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Por favor contacta al administrador para recuperar tu contrasena enviando un email a: colchonqn@marianoaliandri.com.ar');
                }}
                className="text-primary hover:text-accent transition-colors flex items-center gap-1 justify-start"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Olvidaste tu contrasena?</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              isLogin ? 'Iniciar Sesion' : 'Registrarse'
            )}
          </button>

          {/* Switch Mode */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isLogin ? 'No tienes una cuenta?' : 'Ya tienes una cuenta?'}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-primary font-medium hover:text-accent transition-colors"
              >
                {isLogin ? 'Registrate aqui' : 'Inicia sesion'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
