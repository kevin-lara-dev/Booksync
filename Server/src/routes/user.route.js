const express = require("express");
const UserController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// todos los usuarios — solo admin
router.get("/", verifyToken, isAdmin, UserController.getAllUsers);

// ver mi perfil
router.get("/profile", verifyToken, UserController.getProfile);

// actualizar mis datos
router.put("/profile", verifyToken, UserController.updateProfile);

// cambiar mi contraseña — OJO: tiene que ir antes de /:id/... sino express lo confunde con un id
router.patch("/profile/password", verifyToken, UserController.changePassword);

// activar o desactivar un usuario — solo admin
router.patch("/:id/status", verifyToken, isAdmin, UserController.changeStatus);

// cambiar rol de un usuario — solo admin
router.patch("/:id/role", verifyToken, isAdmin, UserController.changeRole);

// desactivar mi cuenta (soft delete)
router.delete("/profile", verifyToken, UserController.deleteProfile);

module.exports = router;
