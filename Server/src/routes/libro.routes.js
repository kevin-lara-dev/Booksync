const express = require("express");
const LibroController = require("../controllers/libro.controller");
const verifyToken = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/role.middleware");

const router = express.Router();

// crear libro — solo admin
router.post("/", verifyToken, isAdmin, LibroController.createLibro);

// Importar libros desde CSV — solo admin. Va antes de /:id para que Express no la confunda con un id.
router.post("/import", verifyToken, isAdmin, LibroController.importLibros);

// listar todos con filtros opcionales por query params — usuarios y admin
router.get("/", verifyToken, LibroController.getAllLibros);

// géneros distintos — OJO: tiene que ir antes de /:id sino express lo toma como un id
router.get("/genres", verifyToken, LibroController.getGenres);

// detalle de un libro por id — usuarios y admin
router.get("/:id", verifyToken, LibroController.getLibroById);

// actualizar — solo admin — acepta cambios parciales
router.put("/:id", verifyToken, isAdmin, LibroController.updateLibro);

// eliminar — solo admin — soft delete
router.delete("/:id", verifyToken, isAdmin, LibroController.deleteLibro);

module.exports = router;
