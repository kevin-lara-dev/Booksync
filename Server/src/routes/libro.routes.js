const express = require("express");
const LibroController = require("../controllers/libro.controller");
const verifyToken = require("../middlewares/auth.middleware");

const router = express.Router();

// crear libro
router.post("/", verifyToken, LibroController.createLibro);

// listar todos con filtros opcionales por query params
router.get("/", verifyToken, LibroController.getAllLibros);

// géneros distintos — OJO: tiene que ir antes de /:id sino express lo toma como un id
router.get("/genres", verifyToken, LibroController.getGenres);

// detalle de un libro por id
router.get("/:id", verifyToken, LibroController.getLibroById);

// actualizar — acepta cambios parciales
router.put("/:id", verifyToken, LibroController.updateLibro);

// eliminar — soft delete
router.delete("/:id", verifyToken, LibroController.deleteLibro);

module.exports = router;
