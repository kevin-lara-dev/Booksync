const Libro = require("../models/libro.model");

class LibroController {

  // Crea un nuevo libro en el catálogo
  static async createLibro(req, res) {
    try {
      const { title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description } = req.body;

      // Se usa === undefined para available_quantity porque 0 es un valor válido y !0 devolvería true erróneamente
      if (!title || !author || !genre || !publication_year || available_quantity === undefined || !location || !isbn || !cover || !editorial || !description) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      const libroId = await Libro.create({ title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description });

      return res.status(201).json({ message: "Libro creado correctamente", libroId });

    } catch (error) {
      // MySQL lanza ER_DUP_ENTRY cuando el ISBN ya existe en la tabla
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Ya existe un libro con ese ISBN" });
      }

      return res.status(500).json({ message: "Error al crear libro" });
    }
  }


  // Devuelve todos los libros activos, aplicando filtros opcionales de título, autor, ISBN o género
  static async getAllLibros(req, res) {
    try {
      // Los filtros son opcionales; si no se envían, findAll devuelve todos los libros
      const filters = {
        title: req.query.title,
        author: req.query.author,
        isbn: req.query.isbn,
        genre: req.query.genre,
      };

      // Por defecto se ordena por id descendente para que los libros más recientes aparezcan primero
      const sort = req.query.sort || "id_libro";
      const order = req.query.order === "ASC" ? "ASC" : "DESC";

      const libros = await Libro.findAll(filters, sort, order);

      return res.json({ total: libros.length, libros });

    } catch (error) {
      return res.status(500).json({ message: "Error al obtener los libros" });
    }
  }


  // Busca un libro por su ID. Lo usa la página de detalle del libro.
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


  // Devuelve los géneros distintos que existen en el catálogo
  static async getGenres(req, res) {
    try {
      const genres = await Libro.getGenres();
      return res.json({ total: genres.length, genres });

    } catch (error) {
      return res.status(500).json({ message: "Error al obtener los géneros" });
    }
  }


  // Solo actualiza los campos que llegaron en la petición; los demás no se modifican
  static async updateLibro(req, res) {
    try {
      const { id } = req.params;
      const { title, author, genre, publication_year, available_quantity, location, isbn, status, cover, editorial, description } = req.body;

      // Si no llegó ningún campo no tiene sentido hacer la consulta
      if (
        title === undefined && author === undefined && genre === undefined &&
        publication_year === undefined && available_quantity === undefined &&
        location === undefined && isbn === undefined && status === undefined &&
        cover === undefined && editorial === undefined && description === undefined
      ) {
        return res.status(400).json({ message: "No hay campos para actualizar" });
      }

      const updated = await Libro.update(id, { title, author, genre, publication_year, available_quantity, location, isbn, status, cover, editorial, description });

      // El modelo devuelve false si no encontró el libro o no hubo cambios reales
      if (!updated) {
        return res.status(404).json({ message: "Libro no encontrado o sin cambios" });
      }

      return res.json({ message: "Libro actualizado correctamente" });

    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar el libro" });
    }
  }


  // Importación masiva de libros. Recibe un array de libros que el frontend parseó del CSV.
  static async importLibros(req, res) {
    try {
      const { books } = req.body;

      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ message: "No se enviaron libros para importar" });
      }

      // El modelo inserta uno a uno y acumula los errores sin detener el resto del lote
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


  // Soft delete: no se elimina el libro físicamente, solo se marca como inactivo
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
