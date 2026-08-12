const express = require("express");
const ReservaController = require("../controllers/reserva.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { isStaff } = require("../middlewares/role.middleware");

const router = express.Router();

// ============================
// ADMIN / BIBLIOTECARIO (operación diaria de reservas)
// ============================

// ver todas las reservas del sistema
router.get("/admin", verifyToken, isStaff, ReservaController.adminList);

// crear una reserva a nombre de cualquier usuario
router.post("/admin", verifyToken, isStaff, ReservaController.adminCreate);

// confirmar una reserva
router.patch("/admin/:idReserva/confirmar", verifyToken, isStaff, ReservaController.adminConfirm);

// cancelar una reserva desde el panel
router.patch("/admin/:idReserva/cancelar", verifyToken, isStaff, ReservaController.adminCancel);

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
