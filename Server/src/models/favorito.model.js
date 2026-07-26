// Conexión a la base de datos
const pool = require ("../config/db");


class Favorito {

    // Agrega un libro a los favoritos del usuario
    static async addFavorite(idUsuario, idLibro){
        const sql = `INSERT INTO favorito (id_usuario, id_libro) VALUES (?, ?)`

        const [result] = await pool.query(sql, [idUsuario, idLibro]);
        return result.insertId;
    }

    // Elimina un libro de los favoritos del usuario
    static async deleteFavorite(idUsuario, idLibro){
        const sql = `DELETE FROM favorito WHERE id_usuario = ? AND id_libro = ?`;
        const [result] = await pool.query(sql, [idUsuario, idLibro]);

        return result.affectedRows > 0;
    }

    // Retorna todos los libros favoritos del usuario con sus datos completos
    static async listFavorites(idUsuario){
        const sql = `
        SELECT
        l.id_libro,
        l.title,
        l.author,
        l.genre,
        l.publication_year,
        l.available_quantity,
        l.isbn,
        l.status,
        l.location,
        l.cover,
        l.total_quantity,
        l.editorial,
        l.description
        FROM favorito f
        INNER JOIN libro l ON l.id_libro = f.id_libro
        WHERE f.id_usuario = ?
        AND l.status != "inactivo"
        ORDER BY f.created_at DESC
        `

        const [rows] = await pool.query(sql, [idUsuario]);
        return rows;
    }


    // Retorna solo los IDs de los libros favoritos del usuario
    static async listIdfavorites(idUsuario){
        const sql = `SELECT id_libro FROM favorito WHERE id_usuario = ?`
        const [rows] = await pool.query(sql, [idUsuario]);
        return rows.map(row => row.id_libro);
    }

    // Verifica si un libro específico ya está en los favoritos del usuario
    static async existFavorite(idUsuario, idLibro){
        const sql = `SELECT 1 FROM favorito WHERE id_usuario = ? AND id_libro = ? LIMIT 1`;
        const [rows] = await pool.query(sql, [idUsuario, idLibro]);
        return rows.length > 0;
    }
}

module.exports = Favorito;
