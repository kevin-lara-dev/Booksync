const express = require("express");
const PrestamoController = require("../controllers/prestamo.controller");
const verifyToken = require("../middlewares/auth.middleware");
const { isStaff } = require("../middlewares/role.middleware");

const router = express.Router();

// ============================ Admin / Bibliotecario (operación diaria de préstamos)

// convierte una reserva confirmada en préstamo activo — cuando el usuario retira el libro físicamente
router.post("/reserva/:idReserva", verifyToken, isStaff, PrestamoController.create);

// registrar devolución — libera stock y cierra el préstamo
router.patch("/devolver/:idPrestamo", verifyToken, isStaff, PrestamoController.devolver);

// ver todos los préstamos del sistema
router.get("/list", verifyToken, isStaff, PrestamoController.adminList);

// ============================ usuario

// ver mi historial de préstamos
router.get("/MisPrestamos", verifyToken, PrestamoController.myList);

module.exports = router;
