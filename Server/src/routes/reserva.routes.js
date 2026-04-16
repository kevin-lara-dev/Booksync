const express = require("express");
const ReservaController = require("../controllers/reserva.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

//usuario
router.post("/:idLibro", verifyToken, ReservaController.create);
router.get("/mis", verifyToken, ReservaController.myList);
router.delete("/:idReserva", verifyToken, ReservaController.cancel);

//admin
router.get("/admin", verifyToken, isAdmin, ReservaController.admminList);
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

module.exports = router;
