// va después de verifyToken, solo deja pasar si el usuario es administrador
const isAdmin = (req, res, next) => {
  // si req.user no existe es que verifyToken no se aplicó antes, no debería pasar
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role !== "administrador") {
    return res.status(401).json({ message: "Acceso denegado: solo administradores" });
  }

  next();
};

// va después de verifyToken, deja pasar a administrador y bibliotecario (operación diaria: reservas y préstamos)
const isStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (req.user.role !== "administrador" && req.user.role !== "bibliotecario") {
    return res.status(401).json({ message: "Acceso denegado: solo personal de la biblioteca" });
  }

  next();
};

module.exports = { isAdmin, isStaff };
