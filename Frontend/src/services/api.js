import axios from 'axios';

// Configuración de la URL base de la API
const API_URL = import.meta.env.VITE_API_URL || '/api';
// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// =================== PRODUCTOS ===================

export const getProductos = async () => {
  try {
    const response = await api.get('/productos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

export const getCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

// =================== AUTENTICACIÓN ===================

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

// =================== VENTAS / PRESUPUESTOS ===================

export const guardarVenta = async (ventaData) => {
  try {
    const response = await api.post('/ventas', ventaData);
    return response.data;
  } catch (error) {
    console.error('Error al guardar venta:', error);
    throw error;
  }
};

export const getHistorialVentas = async () => {
  try {
    const response = await api.get('/ventas/historial');
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

export const enviarPresupuesto = async (presupuestoData) => {
  try {
    const response = await api.post('/presupuesto/enviar', presupuestoData);
    return response.data;
  } catch (error) {
    console.error('Error al enviar presupuesto:', error);
    throw error;
  }
};

export default api;
