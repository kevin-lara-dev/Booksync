const express = require("express");
const ReservaController = require("../controllers/reserva.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// ============================
// ADMIN
// ============================
router.get("/admin", verifyToken, isAdmin, ReservaController.adminList);
router.patch(
  "/admin/:idReserva/confirmar",
  verifyToken,
  isAdmin,
  ReservaController.adminConfirm,
);
router.patch(
  "/admin/:idReserva/cancelar",
  verifyToken,
  isAdmin,
  ReservaController.adminCancel,
);

// ============================
// usuario
// ============================
router.get("/mis", verifyToken, ReservaController.myList);
router.post("/:idLibro", verifyToken, ReservaController.create);
router.delete("/:idReserva", verifyToken, ReservaController.cancel);

module.exports = router;
