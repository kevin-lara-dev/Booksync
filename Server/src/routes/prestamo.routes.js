const express = require("express");
const PrestamoController = require("../controllers/prestamo.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// ============================ Admin

router.post(
  "/reserva/:idReserva",
  verifyToken,
  isAdmin,
  PrestamoController.create,
);
router.post(
  "/devolver/:idPrestamo",
  verifyToken,
  isAdmin,
  PrestamoController.devolver,
);
router.get("/list", verifyToken, isAdmin, PrestamoController.adminList);

// ============================ user
router.get("/MisPrestamos", verifyToken, PrestamoController.myList);

module.exports = router;
