'use client';
import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, HelpCircle, ArrowLeft, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { forgotPassword, resetPassword } from '@/services/api';

export const AuthModal = ({ isOpen, onClose }) => {
  // Views: 'login' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const storeLogin = useAuthStore((state) => state.login);
  const storeRegister = useAuthStore((state) => state.register);

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
      if (view === 'login') {
        const result = await storeLogin(email, password);
        if (!result.success) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        onClose();
      } else if (view === 'register') {
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
        const result = await storeRegister(email, password);
        if (!result.success) {
          setError(result.error);
          setLoading(false);
          return;
        }

        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        }

        onClose();
      }
    } catch (err) {
      console.error('Error en auth:', err);
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(resetEmail);
      setSuccess('Si el email esta registrado, recibiras un codigo de 6 digitos. Revisa tu bandeja de entrada y spam.');
      setTimeout(() => {
        setView('reset');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el codigo');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setError('Las contrasenas no coinciden');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(resetEmail, resetCode, newPassword);
      setSuccess('Contrasena actualizada! Ya podes iniciar sesion.');
      setTimeout(() => {
        setView('login');
        setEmail(resetEmail);
        setPassword('');
        setSuccess('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contrasena');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setRememberMe(false);
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const goToView = (newView) => {
    resetForm();
    setView(newView);
  };

  if (!isOpen) return null;

  const headerConfig = {
    login: { title: 'Iniciar Sesion', subtitle: 'Accede a tu cuenta', icon: User },
    register: { title: 'Registrarse', subtitle: 'Crea una nueva cuenta', icon: User },
    forgot: { title: 'Recuperar Contrasena', subtitle: 'Te enviaremos un codigo por email', icon: Mail },
    reset: { title: 'Nueva Contrasena', subtitle: 'Ingresa el codigo que recibiste', icon: KeyRound },
  };

  const { title, subtitle, icon: HeaderIcon } = headerConfig[view];

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
          {(view === 'forgot' || view === 'reset') && (
            <button
              onClick={() => goToView('login')}
              className="absolute top-4 left-4 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center space-x-3">
            <HeaderIcon className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-purple-100 text-sm">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* LOGIN / REGISTER Form */}
        {(view === 'login' || view === 'register') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contrasena
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {view === 'login' && (
              <>
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

                <div className="flex flex-col space-y-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const savedEmail = localStorage.getItem('savedEmail');
                      if (savedEmail) {
                        alert(`Tu usuario guardado es: ${savedEmail}`);
                        setEmail(savedEmail);
                      } else {
                        alert('No hay usuarios guardados en este navegador.');
                      }
                    }}
                    className="text-primary hover:text-accent transition-colors flex items-center gap-1 justify-start"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Olvidaste tu usuario?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToView('forgot')}
                    className="text-primary hover:text-accent transition-colors flex items-center gap-1 justify-start"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Olvidaste tu contrasena?</span>
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                view === 'login' ? 'Iniciar Sesion' : 'Registrarse'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {view === 'login' ? 'No tienes una cuenta?' : 'Ya tienes una cuenta?'}
                <button
                  type="button"
                  onClick={() => goToView(view === 'login' ? 'register' : 'login')}
                  className="ml-2 text-primary font-medium hover:text-accent transition-colors"
                >
                  {view === 'login' ? 'Registrate aqui' : 'Inicia sesion'}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD Form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Ingresa tu email y te enviaremos un codigo de 6 digitos para restablecer tu contrasena.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Enviar codigo'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => goToView('login')}
                className="text-sm text-primary hover:text-accent transition-colors"
              >
                Volver a iniciar sesion
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD Form */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Ingresa el codigo de 6 digitos que recibiste por email y tu nueva contrasena.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codigo de recupero
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field pl-10 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar nueva contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || resetCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Cambiar contrasena'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200 space-y-2">
              <button
                type="button"
                onClick={() => goToView('forgot')}
                className="text-sm text-primary hover:text-accent transition-colors block w-full"
              >
                No recibiste el codigo? Reenviar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
