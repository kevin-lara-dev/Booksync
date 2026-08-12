/*
  Modelo de libro.
  Contiene todas las operaciones sobre la tabla "libro":
  crear, listar con filtros, buscar por ID, obtener géneros,
  actualizar, eliminar (soft delete) e importar en lote desde CSV.
*/

const pool = require ("../config/db")

class Libro {

    // Inserta un libro nuevo, o si ya existe un libro inactivo (eliminado) con ese mismo ISBN,
    // revive esa fila en vez de insertar una nueva. la fila también conserva el historial de
    // préstamos/reservas que ya apuntaban a ese id_libro. La usan create() y bulkCreate().
    static async _insertOrRevive({
        title,
        author,
        genre,
        publication_year,
        available_quantity,
        location,
        isbn,
        cover,
        editorial,
        description
    }){
        const [existing] = await pool.query(
            `SELECT id_libro FROM libro WHERE isbn = ? AND status = 'inactivo'`,
            [isbn]
        );

        if (existing.length > 0) {
            const idLibro = existing[0].id_libro;
            const updateSql = `
            UPDATE libro
            SET title = ?, author = ?, genre = ?, publication_year = ?, available_quantity = ?,
                location = ?, status = 'disponible', cover = ?, editorial = ?, description = ?
            WHERE id_libro = ?
            `;
            await pool.query(updateSql, [title, author, genre, publication_year, available_quantity, location, cover, editorial, description, idLibro]);
            return idLibro;
        }

        const sql = `
        INSERT INTO libro
        (title, author, genre, publication_year, available_quantity, location, isbn, status, cover, editorial, description)
        VALUES (?,?,?,?,?,?,?,'disponible',?,?,?)
        `;

        const [result] = await pool.query(sql, [title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description]);
        return result.insertId
    };

    // Inserta un nuevo libro con estado "disponible" por defecto
    static async create({
        title,
        author,
        genre,
        publication_year,
        available_quantity,
        location,
        isbn,
        cover,
        editorial,
        description
    }){
        return await Libro._insertOrRevive({ title, author, genre, publication_year, available_quantity, location, isbn, cover, editorial, description });
    };

    // Devuelve todos los libros activos aplicando los filtros y el orden que lleguen
    static async findAll(filters = {}, sort = "id_libro", order = "DESC"){
        let sql = `SELECT
            id_libro,
            title,
            author,
            genre,
            publication_year,
            available_quantity,
            location,
            isbn,
            status,
            cover,
            editorial,
            description
            FROM libro WHERE status != 'inactivo'
        `;

        const values = [];

        // Búsqueda general: coincide si el texto aparece en título, autor o ISBN (OR, no AND).
        // La usa la barra de búsqueda del Home. Los filtros de abajo (title, author, isbn) son
        // exactos e independientes, pensados para un filtro avanzado futuro.
        if(filters.search){
            sql += ` AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)`
            const term = `%${filters.search}%`;
            values.push(term, term, term);
        }

        if(filters.title){
            sql += ` AND title LIKE ?`
            values.push(`%${filters.title}%`);
        }

        if(filters.author){
            sql += ` AND author LIKE ?`
            values.push(`%${filters.author}%`);
        }

        if(filters.isbn){
            sql += ` AND isbn = ?`
            values.push(filters.isbn);
        }

        if(filters.genre){
            sql += ` AND genre = ?`
            values.push(filters.genre);
        }

        // Valida el campo de ordenamiento contra una lista blanca para evitar inyección SQL
        const allowedSortFields = ["id_libro", "title", "author", "publication_year"]

        if(!allowedSortFields.includes(sort)){
            sort = "id_libro"
        }

        order = order === "ASC" ? "ASC" : "DESC";

        sql += ` ORDER BY ${sort} ${order}`;

        const [rows] = await pool.query(sql, values)
        return rows
    }

    // Busca un libro activo por su ID
    static async findById(idLibro){
        const sql = `SELECT
        id_libro,
        title,
        author,
        genre,
        publication_year,
        available_quantity,
        location,
        isbn,
        status,
        cover,
        editorial,
        description
        FROM libro WHERE id_libro = ? AND status != "inactivo"
        `;

        const [rows] = await pool.query(sql, [idLibro]);
        return rows[0];
        }

    // Devuelve los libros activos ordenados por cantidad de préstamos históricos (los "más recomendados").
    // Usa LEFT JOIN para que los libros sin ningún préstamo también aparezcan (con conteo 0),
    // y como desempate entre libros con el mismo conteo, prioriza los más recientes.
    static async findMostBorrowed(limit = 8){
        const sql = `
        SELECT
            l.id_libro,
            l.title,
            l.author,
            l.genre,
            l.publication_year,
            l.available_quantity,
            l.location,
            l.isbn,
            l.status,
            l.cover,
            l.editorial,
            l.description,
            COUNT(p.id_prestamo) AS veces_prestado
        FROM libro l
        LEFT JOIN prestamo p ON p.id_libro = l.id_libro
        WHERE l.status != 'inactivo'
        GROUP BY l.id_libro
        ORDER BY veces_prestado DESC, l.id_libro DESC
        LIMIT ?
        `;

        const [rows] = await pool.query(sql, [limit]);
        return rows;
    }

    // Obtiene todos los géneros distintos que existen en el catálogo
    static async getGenres (){
        const sql = `SELECT DISTINCT genre FROM libro WHERE status != "inactivo" ORDER BY genre ASC`

        const [rows] = await pool.query(sql)
        return rows.map(row => row.genre)
    }

    // Actualiza los campos del libro que se reciban, ignorando los que vengan como undefined
    static async update (idLibro, data){
        const field = [];
        const values = [];

        for (const [key, value] of  Object.entries(data)){
            if(value !== undefined) {
                field.push(`${key} = ?`);
                values.push(value);
            }
        }

        if(field.length === 0){
            return false;
        }

        values.push(idLibro);

        const sql = `UPDATE libro SET ${field.join(', ')} WHERE id_libro = ?`;

        const [result] = await pool.query(sql, values);
        return result.affectedRows > 0
    }

    // Soft delete: desactiva el libro marcándolo como "inactivo" sin eliminarlo físicamente
    static async delete(idLibro){
        const sql = `UPDATE libro SET status = 'inactivo' WHERE id_libro = ?`;

        const [result] = await pool.query(sql, [idLibro]);
        return result.affectedRows > 0
    }

    // Importación masiva: inserta los libros uno a uno para poder reportar cuáles fallaron
    // sin cancelar todo el proceso si uno da error.
    static async bulkCreate(books) {
        const results = { created: 0, errors: [] };

        for (const book of books) {
            try {
                await Libro._insertOrRevive({
                    title: book.title,
                    author: book.author,
                    genre: book.genre         || "",
                    publication_year: book.publication_year || null,
                    available_quantity: book.available_quantity || 0,
                    location: book.location      || "",
                    isbn: book.isbn,
                    cover: book.cover         || "",
                    editorial: book.editorial     || "",
                    description: book.description   || "",
                });
                results.created++;
            } catch (error) {
                // ER_DUP_ENTRY indica ISBN duplicado. Se reporta el error pero se continúa con el resto del lote.
                results.errors.push({
                    isbn: book.isbn,
                    message: error.code === "ER_DUP_ENTRY"
                        ? "ISBN duplicado"
                        : error.message,
                });
            }
        }

        return results;
    }
}

module.exports = Libro
