/**
 * middleware/auth.js
 * 
 * Middleware centralizado para autenticación JWT
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware de validación JWT
 * Extrae el token del header Authorization y lo valida
 * Almacena los datos del usuario decodificado en req.user
 */
const validateToken = (req, res, next) => {

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token Válido");
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
    console.log("Token Expirado");
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(401).json({ error: "Token inválido" });
  }
};

/**
 * Función para generar JWT
 * @param {string} userId - ID del usuario
 * @param {string} username - Username del usuario
 * @returns {string} JWT token
 */
const generateToken = (userId, username) => {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

module.exports = { validateToken, generateToken };
