const express = require("express");
const AuthController = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/auth.middleware");

const router = express.Router();

//regitro — publica, no necesita token
router.post("/register", AuthController.register);

//login — publica, devuelve el token si todo está bien
router.post("/login", AuthController.login);

// ruta de prueba pa verificar que verifyToken funciona — borrar en producción
router.get("/test-protected", verifyToken, (req, res) => {
  res.json({ message: "Accediste a una ruta protegida", user: req.user });
});

module.exports = router;
