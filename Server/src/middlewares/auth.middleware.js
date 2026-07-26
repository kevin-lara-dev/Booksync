const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware que protege las rutas privadas. Verifica que la petición incluya un token JWT válido.
const verifyToken = (req, res, next) => {
  // El token llega en el header Authorization con el formato "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // Extrae solo el token, descartando el prefijo "Bearer"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    // Si el token expiró o la firma no corresponde, jwt.verify lanza un error que se captura abajo
    const decoded = jwt.verify(token, JWT_SECRET);
    // Guarda el payload decodificado en req.user para que los controllers puedan leerlo
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = verifyToken;
