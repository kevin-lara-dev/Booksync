const Favorito = require("../models/favorito.model")

class FavoritoController {

    // Agrega un libro a los favoritos del usuario autenticado
    static async addFavorite(req, res){
        try {
            const idUsuario = req.user.id; // El id del usuario llega del token JWT validado por el middleware
            const idLibro = Number(req.params.idLibro);

            if(!Number.isInteger(idLibro) || idLibro <= 0){
                return res.status(400).json({
                    message: "id del Libro invalido "
                })
            }

            const favorite = await Favorito.addFavorite(idUsuario, idLibro);

            return res.status(201).json({
                message: "Agregado a favoritos",
                favorite
            })

        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(200).json({ message: "Ya estaba en favoritos" });
            }

            if (error.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(404).json({ message: "El libro no existe" });
            }

            return res
                .status(500)
                .json({ message: "Error agregando favorito", error: error.message });
            }
        }

    // Quita un libro de los favoritos del usuario autenticado
    static async deleteFavorite(req, res){
        try {
            const idUsuario = req.user.id; // El id del usuario llega del token JWT validado por el middleware
            const idLibro = Number(req.params.idLibro);

            if(!Number.isInteger(idLibro) || idLibro <= 0){
                return res.status(400).json({
                    message: "id del Libro invalido "
                })
            }

            const removed = await Favorito.deleteFavorite(idUsuario, idLibro)

            if(!removed){
                return res.status(404).json({
                    message: "Favorito no encontrado"
                })
            }

            return res.json({ message: "Eliminado de favoritos" })

        } catch (error) {
            return res.status(500).json({
                message: "Error eliminando favorito", error: error.message
            })
        }
    };


    // Retorna todos los libros favoritos del usuario autenticado con sus datos completos
    static async getFavorites(req, res){
        try {
            const idUsuario = req.user.id; // El id del usuario llega del token JWT validado por el middleware
            const favorite = await Favorito.listFavorites(idUsuario);

            return res.json({ favorite });

        } catch (error) {
            return res.status(500).json({ message: "Error listando favoritos", error: error.message });
        }
    }


    // Retorna solo los IDs de los libros favoritos del usuario autenticado
    static async getFavoritesId(req, res){
        try {
            const idUsuario = req.user.id; // El id del usuario llega del token JWT validado por el middleware
            const favoriteId = await Favorito.listIdfavorites(idUsuario)
            return res.json({ favoriteId });
        } catch (error) {
            return res.status(500).json({ message: "Error listando favoritos por id", error: error.message });
        }
    }

    // Verifica si un libro específico ya está en los favoritos del usuario autenticado
    static async isFavorite (req, res){
        try {
            const idUsuario = req.user.id; // El id del usuario llega del token JWT validado por el middleware
            const idLibro = Number(req.params.idLibro);

            if (!Number.isInteger(idLibro) || idLibro <= 0) {
                return res.status(400).json({ message: "idLibro inválido" });
            }

            const isFav = await Favorito.existFavorite(idUsuario, idLibro);
            return res.json({ isFav });

        } catch (error) {
            return res.status(500).json({ message: "Error verificando favorito", error: error.message });
        }
    }
}

module.exports = FavoritoController;
