import { useState, useMemo, useRef, useEffect } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
import Sidebar from "../../components/sidebar"
import {useLogoutToast} from "../../hooks/useLogoutToast"
import { useToast } from "../../hooks/useToast";
import { getLibrosRequest, createLibro, updateLibro, deleteLibro, importLibros } from "../../services/libro.service";
import BookFormModal from "./BookFormModal";
import Swal from "sweetalert2";


const initialFormState = {
    isbn: "",
    title: "",
    author: "",
    genre: "",
    publication_year: "",
    available_quantity: 0,
    location: "",
    status: "disponible",
    cover: ""
}


function InventarioAdmin (){
    const [books, setbooks] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    const [formData, setFormData] = useState({
        isbn: "",
        title: "",
        author: "",
        genre: "",
        publication_year: "",
        available_quantity: 0,
        location: "",
        status: "disponible",
        cover: ""
    })

    // paginación
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const {toast: logoutToast, openToast} = useLogoutToast();
    const { toast: feedbackToast, showToast } = useToast();

    // ref para el input file oculto del importar CSV
    const importInputRef = useRef(null);



    const fetchLibros = async () =>{
        try {
            const data = await getLibrosRequest();
            setbooks(data.libros || []);
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLibros()
    }, []);


    //BUSCADOR
    const filteredBooks = useMemo(() => {
        if(!search.trim()) return books;
        
        const term =  search.toLowerCase();
        return books.filter((book) => 
            [
                book.isbn,
                book.title,
                book.author,
                book.genre,
                book.location,
                book.publication_year,
                book.available_quantity,

            ]
            .join(" ")
            .toLowerCase()
            .includes(term)
        );
    }, [books, search]);



    const  handleSearchChange = (event) => {
        setSearch(event.target.value);
    };


    //ABRIMOS FORM
    const handleAddBook = () => {
        setEditingBook(null)
        setFormData(initialFormState)
        setShowForm(true)
    };


    //CREAMOS LIBRO
    const handleSubmitBook = async () => {
        try {

            if (editingBook) {
                // UPDATE
                await updateLibro(editingBook.id_libro, formData);
            } else {
                // CREATE
                await createLibro(formData);
            }

            setShowForm(false);
            setEditingBook(null)
            setFormData(initialFormState);

            fetchLibros();

        } catch (error) {
            if (error.response?.status === 409) {
                showToast("Error", "Ya existe un libro con ese ISBN");
            } else {
                showToast("Error", "Error al crear el libro");
            }
        }
    };


    //EDITAMOS LIBRO
    const handleEditBook = (book) => {
        setEditingBook(book);
        setFormData({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            genre: book.genre,
            publication_year: book.publication_year,
            available_quantity: book.available_quantity,
            location: book.location,
            status: book.status,
            cover: book.cover || ""
        });

        setShowForm(true);
    }


    //BORRAMOS BOOK
    const handleDeleteBook = async (book) => {
        const { isConfirmed } = await Swal.fire({
            title: "¿Eliminar libro?",
            text: `"${book.title}" será eliminado del inventario.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            background: "#fef6e1",
            color: "#2b1b0b",
            confirmButtonColor: "#b31313",
            cancelButtonColor: "#9e8c78",
            customClass: { popup: "swal-confirm-booksync" },
        });

        if (!isConfirmed) return;

        try {
            await deleteLibro(book.id_libro);
            fetchLibros();
        } catch (error) {
            showToast("Error", "Error al eliminar el libro")
        }
    }


    // EXPORTAR CSV — genera el archivo en el navegador sin ir al servidor
    const handleExport = () => {
        if (books.length === 0) {
            showToast("Aviso", "No hay libros en el inventario para exportar");
            return;
        }

        const headers = ["isbn", "title", "author", "genre", "publication_year",
                         "available_quantity", "location", "status", "editorial", "description"];

        // envuelvo cada valor en comillas dobles y escapo las comillas internas
        const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

        const csvRows = [
            headers.join(","),
            ...books.map((b) => headers.map((h) => escape(b[h])).join(",")),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `inventario_booksync_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };


    // IMPORTAR CSV — abre el selector de archivos
    const handleImport = () => {
        importInputRef.current?.click();
    };

    // se dispara cuando el usuario elige un archivo CSV
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.trim().split(/\r?\n/);

            if (lines.length < 2) {
                showToast("Error", "El CSV no tiene datos");
                return;
            }

            // primera fila = encabezados, limpios de comillas y espacios
            const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

            // parseo simple: separo por coma respetando campos entre comillas
            const parseRow = (line) => {
                const values = [];
                let current = "";
                let inQuotes = false;
                for (const ch of line) {
                    if (ch === '"') { inQuotes = !inQuotes; }
                    else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
                    else { current += ch; }
                }
                values.push(current.trim());
                return values;
            };

            const parsedBooks = lines.slice(1)
                .map((line) => {
                    const values = parseRow(line);
                    const row = {};
                    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
                    return row;
                })
                .filter((row) => row.isbn?.trim() && row.title?.trim()); // descarto filas vacías

            if (parsedBooks.length === 0) {
                showToast("Error", "No se encontraron filas válidas en el CSV (isbn y title son obligatorios)");
                return;
            }

            const result = await importLibros(parsedBooks);

            if (result.errors?.length > 0) {
                showToast("Importado parcialmente", `${result.created} creados, ${result.errors.length} con error`);
            } else {
                showToast("Listo", result.message);
            }

            fetchLibros();
        } catch (error) {
            showToast("Error", "No se pudo procesar el archivo CSV");
        } finally {
            // limpio el input pa que se pueda volver a importar el mismo archivo
            e.target.value = "";
        }
    };


    const handleBulkAction = (action) => {
        showToast("Próximamente", "Las acciones masivas estarán disponibles pronto");
    };




    // cuando el usuario busca, vuelvo a la primera página pa no quedarme en una vacía
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const visibleIds = filteredBooks.map((b) => b.id_libro);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    const noneVisibleSelected = visibleIds.every((id) => !selectedIds.includes(id));
    const isIndeterminate = !noneVisibleSelected && !allVisibleSelected;
    const selectAllRef = useRef(null);


    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);


    const handleToggleRow = (id) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };



    const handleToggleAll = (event) => { 
        const { checked } = event.target;
        if (checked) {
            setSelectedIds((prev) => {
                const set = new Set(prev);
                visibleIds.forEach((id) => set.add(id));
                return Array.from(set);
            });
        } else {
            setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
        }
    };



    return (
        <div className="inventory-admin-page">
            <div className="inventory-admin-layout">
                <Sidebar onLogout={openToast} />
                
                <main className="inventory-admin-main">
                    <section className="inventory-admin-panel">
                        <header className="inventory-admin-header">
                            <div className="inventory-admin-title-block">
                                <h1 className="inventory-admin-title">Inventario</h1>
                                <span className="inventory-admin-counter">{filteredBooks.length}</span>
                            </div>

                            <div className="inventory-admin-header-actions">
                                <button type="button" className="inv-btn inv-btn--primary" onClick={handleAddBook}>
                                    <i className="fa-solid fa-plus" aria-hidden="true" />
                                    <span>Agregar libro</span>
                                </button>

                                        <button type="button" className="inv-btn inv-btn--primary" onClick={handleImport}>
                                    <i className="fa-solid fa-file-import" aria-hidden="true" />
                                    <span>Importar</span>
                                </button>
                                {/* input oculto — solo acepta CSV */}
                                <input
                                    ref={importInputRef}
                                    type="file"
                                    accept=".csv,text/csv"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />

                                <button type="button" className="inv-btn inv-btn--primary" onClick={handleExport}>
                                    <i className="fa-solid fa-file-export" aria-hidden="true" />
                                    <span>Exportar</span>
                                </button>
                            </div>
                        </header>

                        <div className="inventory-admin-search-row">
                            <div className="inventory-admin-search">
                                <span className="search-icon">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </span>
                                <input type="text" placeholder="Título, autor, ISBN, código" value={search} onChange={handleSearchChange}/>
                                <button type="button" className="search-voice" aria-label="Busqueda por voz">
                                    <i className="fa-solid fa-microphone" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="inventory-admin-filters-row">
                            <button type="button" className="inv-chip">
                                <i className="fa-solid fa-layer-group" />
                                <span>Categoria</span>
                                <i className="fa-solid fa-chevron-down" />
                            </button>

                            <button type="button" className="inv-chip">
                                <i className="fa-solid fa-toggle-on" />
                                <span>Estado</span>
                                <i className="fa-solid fa-chevron-down" />
                            </button>

                            <button type="button" className="inv-chip">
                                <i className="fa-solid fa-location-dot" />
                                <span>Ubicación</span>
                                <i className="fa-solid fa-chevron-down" />
                            </button>

                            <button type="button" className="inv-chip">
                                <i className="fa-solid fa-boxes-stacked" />
                                <span>Stock</span>
                                <i className="fa-solid fa-chevron-down" />
                            </button>

                            <button type="button" className="inv-chip">
                                <i className="fa-solid fa-calendar" />
                                <span>Año</span>
                                <i className="fa-solid fa-chevron-down" />
                            </button>
                        </div>

                        {/* ===== TABLE ===== */}
                        {loading ? (
                            <p style={{ padding: "1rem" }}>
                                Cargando inventario...
                            </p>
                        ) : (
                            <div className="inventory-admin-table-wrapper">
                                <table className="inventory-admin-table">
                                    <thead>
                                        <tr>
                                            <th className="col-checkbox">
                                                <input type="checkbox" aria-label="Seleccionar todos" ref={selectAllRef} checked={allVisibleSelected} onChange={handleToggleAll} />
                                            </th>
                                            <th>Portada</th>
                                            <th>Código / ISBN</th>
                                            <th>Título</th>
                                            <th>Autor</th>
                                            <th>Categoría</th>
                                            <th>Ubicación</th>
                                            <th className="col-stock">Stock</th>
                                            <th className="col-actions">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedBooks.map((book) => (
                                            <tr key={book.id_libro}>
                                                <td className="col-checkbox">
                                                    <input type="checkbox" aria-label={`Seleccionar ${book.title}`} checked={selectedIds.includes(book.id_libro)} onChange={() => handleToggleRow(book.id_libro)}/>
                                                    
                                                </td>
                                                <td>
                                                    {book.cover && (
                                                        <img
                                                        src={`${SERVER_URL}${book.cover}`}
                                                        alt={book.title}
                                                        width="40"
                                                        style={{ borderRadius: "4px" }}
                                                        />
                                                    )}
                                                </td>
                                                <td>{book.isbn}</td>
                                                <td>{book.title}</td>
                                                <td>{book.author}</td>
                                                <td>{book.genre}</td>
                                                <td>{book.location}</td>
                                                <td className="col-stock">
                                                    <span className="stock-pill">
                                                        <span className="stock-pill__number">
                                                            {book.available_quantity}
                                                        </span>
                                                        <span className="stock-pill__status">
                                                            {book.status}
                                                        </span> 
                                                    </span>
                                                </td>
                                                <td className="col-actions">
                                                    <button type="button" className="row-action" title="Editar" onClick={() => handleEditBook(book)}>
                                                        <i className="fa-solid fa-pen" />
                                                    </button>

                                                    <button type="button" className="row-action row-action--danger" title="Eliminar" onClick={() => handleDeleteBook(book)} >
                                                        <i className="fa-solid fa-trash" />
                                                    </button>

                                                </td>
                                            </tr>
                                        ))}

                                        {!loading && filteredBooks.length === 0 && (
                                            <tr>
                                                <td colSpan = {8} className="no-results">
                                                    No hay libros registrados en el sistema.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* FORMULARIO */}
                        <BookFormModal
                        open={showForm}
                        onOpenChange={(open) => {
                            setShowForm(open);
                            if (!open) {
                                setEditingBook(null);
                                setFormData(initialFormState);
                            }
                        }}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmitBook}
                        isEditing={!!editingBook}
                        />

                        {/* ===== PAGINACIÓN ===== */}
                        {totalPages > 1 && (
                            <div className="pagination" role="navigation" aria-label="Paginacion">
                                <button
                                    className="pagination-btn"
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Pagina anterior"
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`pagination-btn ${page === currentPage ? "pagination-btn--active" : ""}`}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        aria-current={page === currentPage ? "page" : undefined}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="pagination-btn"
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Pagina siguiente"
                                >
                                    <i className="fa-solid fa-chevron-right" />
                                </button>
                            </div>
                        )}

                        {/* ===== FOOTER ===== */}
                        <footer className="inventory-admin-footer">
                            <div className="inventory-admin-bulk-actions">
                                <button type="button" className="inv-btn inv-btn--primary" onClick={() => handleBulkAction("Ajustar stock")}>
                                    <i className="fa-solid fa-sliders" />
                                    <span>Ajustar stock</span>
                                </button>
                            </div>
                        </footer>
                    </section>
                    {logoutToast}
                    {feedbackToast}
                </main>
            </div>
        </div>
    )


}

export default InventarioAdmin;