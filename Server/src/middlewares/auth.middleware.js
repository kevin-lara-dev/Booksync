const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// pongo esto antes de cada ruta privada pa asegurarme que el usuario tiene un token válido
const verifyToken = (req, res, next) => {
  // el token llega así: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // me quedo solo con la parte del token, sin el "Bearer"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    // si el token expiró o la firma no cuadra, esto lanza un error
    const decoded = jwt.verify(token, JWT_SECRET);
    // guardo el payload en req.user pa que los controllers lo puedan usar
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = verifyToken;
