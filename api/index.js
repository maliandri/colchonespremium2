export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Aluminé Hogar API',
    status: 'online',
    endpoints: {
      health: '/api/health',
      productos: '/api/productos',
      categorias: '/api/categorias',
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register'
      }
    }
  });
}