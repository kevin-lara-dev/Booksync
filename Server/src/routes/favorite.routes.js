const express = require("express");
const FavoritoController = require("../controllers/favorite.controller");
const verifyToken = require("../middlewares/auth.middleware");

const router = express.Router();

// todos mis favoritos con datos del libro
router.get("/", verifyToken, FavoritoController.getFavorites);

// solo los ids — pa saber qué corazones pintar activos en el ui sin traer todo
router.get("/ids", verifyToken, FavoritoController.getFavoritesId);

// verificar si un libro específico ya está en mis favoritos
router.get("/:idLibro", verifyToken, FavoritoController.isFavorite);

// agregar a favoritos
router.post("/:idLibro", verifyToken, FavoritoController.addFavorite);

// quitar de favoritos
router.delete("/:idLibro", verifyToken, FavoritoController.deleteFavorite);

module.exports = router;
