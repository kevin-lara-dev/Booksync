const express = require("express");
const ReservaController = require("../controllers/reserva.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// ============================
// ADMIN
// ============================

// ver todas las reservas del sistema
router.get("/admin", verifyToken, isAdmin, ReservaController.adminList);

// confirmar una reserva
router.patch("/admin/:idReserva/confirmar", verifyToken, isAdmin, ReservaController.adminConfirm);

// cancelar una reserva desde el panel
router.patch("/admin/:idReserva/cancelar", verifyToken, isAdmin, ReservaController.adminCancel);

// ============================
// usuario
// ============================

// ver mis reservas
router.get("/mis", verifyToken, ReservaController.myList);

// crear una reserva para un libro
router.post("/:idLibro", verifyToken, ReservaController.create);

// cancelar una de mis reservas
router.delete("/:idReserva", verifyToken, ReservaController.cancel);

module.exports = router;
