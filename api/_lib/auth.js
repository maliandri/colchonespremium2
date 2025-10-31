import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    return verified;
  } catch (err) {
    throw new Error('Token inválido');
  }
}

export function getTokenFromRequest(req) {
  const authHeader = req.headers['auth-token'] || req.headers['authorization'];
  
  if (!authHeader) {
    return null;
  }

  // Soportar formato "Bearer token" o solo "token"
  return authHeader.replace('Bearer ', '');
}

export function authMiddleware(handler) {
  return async (req, res) => {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado.' });
    }

    try {
      const verified = verifyToken(token);
      req.user = verified;
      return handler(req, res);
    } catch (err) {
      return res.status(400).json({ error: 'Token inválido.' });
    }
  };
}

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
}