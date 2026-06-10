const express = require("express");
const PrestamoController = require("../controllers/prestamo.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// ============================ Admin

// convierte una reserva confirmada en préstamo activo — cuando el usuario retira el libro físicamente
router.post("/reserva/:idReserva", verifyToken, isAdmin, PrestamoController.create);

// registrar devolución — libera stock y cierra el préstamo
router.patch("/devolver/:idPrestamo", verifyToken, isAdmin, PrestamoController.devolver);

// ver todos los préstamos del sistema
router.get("/list", verifyToken, isAdmin, PrestamoController.adminList);

// ============================ usuario

// ver mi historial de préstamos
router.get("/MisPrestamos", verifyToken, PrestamoController.myList);

module.exports = router;
