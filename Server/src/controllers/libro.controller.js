const Libro = require("../models/libro.model");

class LibroController {

  //CREAMOS LIBROS
  static async createLibro(req, res) {
    try {
      const { title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description } = req.body;

      // uso === undefined en available_quantity porque 0 es válido y !0 daría true
      if (!title || !author || !genre || !publication_year || available_quantity === undefined || !location || !isbn || !cover || !editorial || !description) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      const libroId = await Libro.create({ title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description });

      return res.status(201).json({ message: "Libro creado correctamente", libroId });

    } catch (error) {
      // mysql manda ER_DUP_ENTRY cuando el isbn ya existe en la tabla
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Ya existe un libro con ese ISBN" });
      }

      return res.status(500).json({ message: "Error al crear libro" });
    }
  }


  //LISTAMOS LIBROS
  static async getAllLibros(req, res) {
    try {
      // los filtros son opcionales, si no llegan findAll devuelve todo
      const filters = {
        title: req.query.title,
        author: req.query.author,
        isbn: req.query.isbn,
        genre: req.query.genre,
      };

      // por defecto ordeno por id desc pa que los más recientes salgan primero
      const sort = req.query.sort || "id_libro";
      const order = req.query.order === "ASC" ? "ASC" : "DESC";

      const libros = await Libro.findAll(filters, sort, order);

      return res.json({ total: libros.length, libros });

    } catch (error) {
      return res.status(500).json({ message: "Error al obtener los libros" });
    }
  }


  //OBTENEMOS LIBRO POR ID — lo uso en la pagina de detalle
  static async getLibroById(req, res) {
    try {
      const { id } = req.params;

      const libro = await Libro.findById(id);

      if (!libro) {
        return res.status(404).json({ message: "Libro no encontrado" });
      }

      return res.json(libro);

    } catch (error) {
      return res.status(500).json({ message: "Error al obtener el libro" });
    }
  }


  //OBTENER GÉNEROS — devuelve los géneros distintos que hay en la bd
  static async getGenres(req, res) {
    try {
      const genres = await Libro.getGenres();
      return res.json({ total: genres.length, genres });

    } catch (error) {
      return res.status(500).json({ message: "Error al obtener los géneros" });
    }
  }


  // Actualizar libro — solo actualizo los campos que lleguen, no toco los demás
  static async updateLibro(req, res) {
    try {
      const { id } = req.params;
      const { title, author, genre, publication_year, available_quantity, location, isbn, status, cover, editorial, description } = req.body;

      // si no llegó ningún campo no tiene sentido hacer la query
      if (
        title === undefined && author === undefined && genre === undefined &&
        publication_year === undefined && available_quantity === undefined &&
        location === undefined && isbn === undefined && status === undefined &&
        cover === undefined && editorial === undefined && description === undefined
      ) {
        return res.status(400).json({ message: "No hay campos para actualizar" });
      }

      const updated = await Libro.update(id, { title, author, genre, publication_year, available_quantity, location, isbn, status, cover, editorial, description });

      // el modelo devuelve false si no encontró el libro o no hubo cambios reales
      if (!updated) {
        return res.status(404).json({ message: "Libro no encontrado o sin cambios" });
      }

      return res.json({ message: "Libro actualizado correctamente" });

    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar el libro" });
    }
  }


  // IMPORTAR LIBROS EN LOTE — recibe un array de libros parseado del CSV en el front
  static async importLibros(req, res) {
    try {
      const { books } = req.body;

      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ message: "No se enviaron libros para importar" });
      }

      // el modelo inserta uno a uno y acumula errores sin frenar todo el lote
      const results = await Libro.bulkCreate(books);

      return res.status(200).json({
        message: `${results.created} libro(s) importado(s) correctamente`,
        created: results.created,
        errors: results.errors,
      });

    } catch (error) {
      return res.status(500).json({ message: "Error al importar libros" });
    }
  }


  //borrar libro — soft delete, no lo borro fisicamente, solo lo pongo inactivo
  static async deleteLibro(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Libro.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Libro no encontrado" });
      }

      return res.json({ message: "Libro eliminado correctamente" });

    } catch (error) {
      return res.status(500).json({ message: "Error al eliminar el libro" });
    }
  }
}

module.exports = LibroController;
