import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "../../styles/BookFormModal.css";
import { crearReservaAdmin } from "../../services/reserva.service";
import { getAllUsers } from "../../services/user.service";
import { getLibrosRequest } from "../../services/libro.service";

export default function NuevaReservaModal({ open, onOpenChange, onCreated }) {
    const [usuarios, setUsuarios] = useState([]);
    const [libros, setLibros] = useState([]);
    const [idUsuario, setIdUsuario] = useState("");
    const [idLibro, setIdLibro] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Al abrir el modal, carga usuarios y libros disponibles y limpia el formulario de la vez anterior
    useEffect(() => {
        if (!open) return;

        setIdUsuario("");
        setIdLibro("");
        setError("");

        const loadData = async () => {
            try {
                const [usersData, librosData] = await Promise.all([
                    getAllUsers(),
                    getLibrosRequest(),
                ]);

                setUsuarios(Array.isArray(usersData) ? usersData : []);
                // Solo tiene sentido reservar libros que estén disponibles y con stock
                setLibros(
                    (librosData.libros || []).filter(
                        (libro) => libro.status === "disponible" && libro.available_quantity > 0,
                    ),
                );
            } catch {
                setError("No se pudieron cargar los usuarios y libros");
            }
        };

        loadData();
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idUsuario || !idLibro) {
            setError("Selecciona un usuario y un libro");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            await crearReservaAdmin(Number(idUsuario), Number(idLibro));
            onCreated();
            onOpenChange(false);
            setIdUsuario("");
            setIdLibro("");
        } catch (err) {
            setError(err.response?.data?.message || "Error al crear la reserva");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay" />

                <Dialog.Content className="modal-content">
                    <Dialog.Title className="modal-title">
                        Nueva reserva
                    </Dialog.Title>

                    <form className="modal-form" onSubmit={handleSubmit}>
                        <div className="modal-grid">
                            <select
                                value={idUsuario}
                                onChange={(e) => setIdUsuario(e.target.value)}
                            >
                                <option value="">Selecciona un usuario</option>
                                {usuarios.map((u) => (
                                    <option key={u.id_usuario} value={u.id_usuario}>
                                        {u.nombre} {u.apellido} ({u.correo})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={idLibro}
                                onChange={(e) => setIdLibro(e.target.value)}
                            >
                                <option value="">Selecciona un libro</option>
                                {libros.map((l) => (
                                    <option key={l.id_libro} value={l.id_libro}>
                                        {l.title} — {l.author} (quedan {l.available_quantity} disponibles)
                                    </option>
                                ))}
                            </select>

                            {error && <span className="cover-upload-error">{error}</span>}
                        </div>

                        <div className="modal-actions">
                            <Dialog.Close asChild>
                                <button type="button" className="inv-btn inv-btn--ghost">
                                    Cancelar
                                </button>
                            </Dialog.Close>

                            <button type="submit" className="inv-btn inv-btn--primary" disabled={submitting}>
                                {submitting ? "Creando..." : "Crear reserva"}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
