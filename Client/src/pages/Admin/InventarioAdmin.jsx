import React, { useState, useMemo, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar"
import {useLogoutToast} from "../../hooks/useLogoutToast"
import { useToast } from "../../hooks/useToast";
import { getLibrosRequest, createLibro, updateLibro, deleteLibro } from "../../services/libro.service";
import BookFormModal from "./BookFormModal";


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

    const {toast: logoutToast, openToast} = useLogoutToast();
    const { toast: feedbackToast, showToast } = useToast();



    const fetchLibros = async () =>{
        try {
            const data = await getLibrosRequest();
            setbooks(data.libros || []);
        } catch (error) {
            console.error("Error al obtener libros", error);
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
        const confirmDelete = window.confirm(`Seguro que desea eliminar el libro ${book.title}?`);

        if(!confirmDelete) return; 

        try {
            await deleteLibro(book.id_libro);
            fetchLibros();
        } catch (error) {
            console.error(error);
            showToast("Error", "Error al eliminar el libro")
        }
    }


    const handleImport = () => {
        showToast("Próximamente", "Importar inventario estará disponible pronto")
    };


    const handleExport = () => {
        showToast("Próximamente", "Exportar inventario estará disponible pronto");
    };


    const handleBulkAction = (action) => {
        showToast("Próximamente", "Las acciones masivas estarán disponibles pronto");
    };




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
                                        {filteredBooks.map((book) => (
                                            <tr key={book.id_libro}>
                                                <td className="col-checkbox">
                                                    <input type="checkbox" aria-label={`Seleccionar ${book.title}`} checked={selectedIds.includes(book.id_libro)} onChange={() => handleToggleRow(book.id_libro)}/>
                                                    
                                                </td>
                                                <td>
                                                    {book.cover && (
                                                        <img
                                                        src={`http://localhost:3000${book.cover}`}
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