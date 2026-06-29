const express = require("express");
const AuthController = require("../controllers/auth.controller");

const router = express.Router();

// registro — pública, no necesita token
router.post("/register", AuthController.register);

// login — pública, devuelve el token si todo está bien
router.post("/login", AuthController.login);

// solicitar reset — pública, recibe el correo y manda el email si existe
router.post("/forgot-password", AuthController.forgotPassword);

// ejecutar reset — pública, recibe el token por URL y la nueva contraseña por body
router.post("/reset-password/:token", AuthController.resetPassword);

module.exports = router;
