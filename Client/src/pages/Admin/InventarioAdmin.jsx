import { useState, useMemo, useRef, useEffect } from "react";

import Sidebar from "../../components/sidebar"
import {useLogoutToast} from "../../hooks/useLogoutToast"
import { useToast } from "../../hooks/useToast";
import { getLibrosRequest, createLibro, updateLibro, deleteLibro, importLibros } from "../../services/libro.service";
import { getCoverUrl } from "../../utils/coverUrl";
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

    const [filtroGenero, setFiltroGenero] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroUbicacion, setFiltroUbicacion] = useState("");
    const [filtroStock, setFiltroStock] = useState("");
    const [filtroAnio, setFiltroAnio] = useState("");

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

    // Configuración de paginación: número de libros por página y página activa
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const {toast: logoutToast, openToast} = useLogoutToast();
    const { toast: feedbackToast, showToast } = useToast();

    // Referencia al input file oculto que se activa al pulsar el botón "Importar"
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


    // Categorías, ubicaciones y años únicos presentes en el inventario, para poblar los selects de filtro
    const categoriasDisponibles = useMemo(() => {
        const set = new Set(books.map((b) => b.genre).filter(Boolean));
        return Array.from(set).sort();
    }, [books]);

    const ubicacionesDisponibles = useMemo(() => {
        const set = new Set(books.map((b) => b.location).filter(Boolean));
        return Array.from(set).sort();
    }, [books]);

    const aniosDisponibles = useMemo(() => {
        const set = new Set(books.map((b) => b.publication_year).filter(Boolean));
        return Array.from(set).sort((a, b) => b - a);
    }, [books]);


    // Filtra los libros en memoria según el texto del buscador y los chips de filtro. useMemo evita recalcular en cada render.
    const filteredBooks = useMemo(() => {
        return books.filter((book) => {
            const matchSearch =
                !search.trim() ||
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
                .includes(search.toLowerCase());

            const matchGenero = !filtroGenero || book.genre === filtroGenero;
            const matchEstado = !filtroEstado || book.status === filtroEstado;
            const matchUbicacion = !filtroUbicacion || book.location === filtroUbicacion;
            const matchAnio = !filtroAnio || String(book.publication_year) === filtroAnio;

            const matchStock = (() => {
                if (!filtroStock) return true;
                if (filtroStock === "con_stock") return book.available_quantity > 2;
                if (filtroStock === "bajo") return book.available_quantity >= 1 && book.available_quantity <= 2;
                if (filtroStock === "agotado") return book.available_quantity === 0;
                return true;
            })();

            return matchSearch && matchGenero && matchEstado && matchUbicacion && matchAnio && matchStock;
        });
    }, [books, search, filtroGenero, filtroEstado, filtroUbicacion, filtroStock, filtroAnio]);



    const  handleSearchChange = (event) => {
        setSearch(event.target.value);
    };


    // Prepara el formulario para agregar un libro nuevo y lo abre vacío
    const handleAddBook = () => {
        setEditingBook(null)
        setFormData(initialFormState)
        setShowForm(true)
    };


    // Guarda el libro: si editingBook tiene valor actualiza, si no crea uno nuevo
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


    // Carga los datos del libro seleccionado en el formulario y lo abre en modo edición
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


    // Pide confirmación mediante SweetAlert2 antes de eliminar el libro (soft delete)
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


    // Exporta el inventario a CSV. El archivo se genera en el navegador sin necesidad de ir al servidor.
    const handleExport = () => {
        if (books.length === 0) {
            showToast("Aviso", "No hay libros en el inventario para exportar");
            return;
        }

        const headers = ["isbn", "title", "author", "genre", "publication_year",
                         "available_quantity", "location", "status", "editorial", "description"];

        // Envuelve cada valor en comillas dobles y escapa las comillas internas para que el CSV sea válido
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


    // Activa el input file oculto para que el usuario seleccione el archivo CSV a importar
    const handleImport = () => {
        importInputRef.current?.click();
    };

    // Se ejecuta cuando el usuario elige un archivo CSV. Lee el contenido, lo parsea y lo envía al servidor.
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

            // La primera fila del CSV son los encabezados; se limpian las comillas y espacios sobrantes
            const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

            // Parser manual: separa por coma pero respeta campos entre comillas (para valores que contengan comas)
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
                .filter((row) => row.isbn?.trim() && row.title?.trim()); // Descarta filas vacías o sin los campos mínimos requeridos

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
            // Limpia el input para que el usuario pueda volver a seleccionar el mismo archivo si es necesario
            e.target.value = "";
        }
    };


    const handleBulkAction = (action) => {
        showToast("Próximamente", "Las acciones masivas estarán disponibles pronto");
    };




    // Cuando el usuario busca, vuelve a la primera página para no quedarse en una página sin resultados
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
                                {/* Input file oculto — solo acepta archivos CSV. Se activa desde el botón "Importar". */}
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
                            <label className={`inv-chip ${filtroGenero ? "inv-chip--active" : ""}`}>
                                <i className="fa-solid fa-layer-group" />
                                <select
                                    className="inv-chip-select"
                                    value={filtroGenero}
                                    onChange={(e) => setFiltroGenero(e.target.value)}
                                >
                                    <option value="">Categoria</option>
                                    {categoriasDisponibles.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </label>

                            <label className={`inv-chip ${filtroEstado ? "inv-chip--active" : ""}`}>
                                <i className="fa-solid fa-toggle-on" />
                                <select
                                    className="inv-chip-select"
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Estado</option>
                                    <option value="disponible">Disponible</option>
                                    <option value="prestado">Prestado</option>
                                    <option value="dañado">Dañado</option>
                                </select>
                            </label>

                            <label className={`inv-chip ${filtroUbicacion ? "inv-chip--active" : ""}`}>
                                <i className="fa-solid fa-location-dot" />
                                <select
                                    className="inv-chip-select"
                                    value={filtroUbicacion}
                                    onChange={(e) => setFiltroUbicacion(e.target.value)}
                                >
                                    <option value="">Ubicación</option>
                                    {ubicacionesDisponibles.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </label>

                            <label className={`inv-chip ${filtroStock ? "inv-chip--active" : ""}`}>
                                <i className="fa-solid fa-boxes-stacked" />
                                <select
                                    className="inv-chip-select"
                                    value={filtroStock}
                                    onChange={(e) => setFiltroStock(e.target.value)}
                                >
                                    <option value="">Stock</option>
                                    <option value="con_stock">Con stock</option>
                                    <option value="bajo">Stock bajo</option>
                                    <option value="agotado">Agotado</option>
                                </select>
                            </label>

                            <label className={`inv-chip ${filtroAnio ? "inv-chip--active" : ""}`}>
                                <i className="fa-solid fa-calendar" />
                                <select
                                    className="inv-chip-select"
                                    value={filtroAnio}
                                    onChange={(e) => setFiltroAnio(e.target.value)}
                                >
                                    <option value="">Año</option>
                                    {aniosDisponibles.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </label>

                            {(filtroGenero || filtroEstado || filtroUbicacion || filtroStock || filtroAnio) && (
                                <button
                                    type="button"
                                    className="inv-chip inv-chip--clear"
                                    onClick={() => {
                                        setFiltroGenero("");
                                        setFiltroEstado("");
                                        setFiltroUbicacion("");
                                        setFiltroStock("");
                                        setFiltroAnio("");
                                    }}
                                >
                                    <i className="fa-solid fa-xmark" />
                                    <span>Limpiar</span>
                                </button>
                            )}
                        </div>

                        {/* ===== TABLE ===== */}
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
                                    {loading && (
                                        <tr>
                                            <td colSpan={9} className="no-results">
                                                Cargando inventario...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && paginatedBooks.map((book) => (
                                            <tr key={book.id_libro}>
                                                <td className="col-checkbox">
                                                    <input type="checkbox" aria-label={`Seleccionar ${book.title}`} checked={selectedIds.includes(book.id_libro)} onChange={() => handleToggleRow(book.id_libro)}/>
                                                    
                                                </td>
                                                <td>
                                                    {book.cover && (
                                                        <img
                                                        src={getCoverUrl(book.cover)}
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
                                                <td colSpan={9} className="no-results">
                                                    No hay libros registrados en el sistema.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

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