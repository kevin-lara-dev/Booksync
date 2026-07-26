import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "../../styles/BookFormModal.css";
import { uploadCover } from "../../services/libro.service";
import { getCoverUrl } from "../../utils/coverUrl";

export default function BookFormModal({
    open,
    onOpenChange,
    formData,
    setFormData,
    onSubmit,
    isEditing,
}){
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError("");
        setUploading(true);

        try {
            const { url } = await uploadCover(file);
            setFormData({ ...formData, cover: url });
        } catch (error) {
            setUploadError(error.response?.data?.message || "Error al subir la portada");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog.Root open = {open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="modal-overlay"/>

                <Dialog.Content className="modal-content">
                    <Dialog.Title className="modal-title">
                        {isEditing ? "Editar libro" : "Agregar libro"}
                    </Dialog.Title>

                    <form className="modal-form" onSubmit={(e) => {e.preventDefault(); onSubmit();}}>
                        <div className="modal-grid">

                        <input
                            placeholder="Título"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            required
                        />

                        <input
                            placeholder="Autor"
                            value={formData.author}
                            onChange={(e) =>
                                setFormData({ ...formData, author: e.target.value })
                            }
                            required
                        />

                        <input
                            placeholder="descripción"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            required
                        />
                        
                        <input
                            placeholder="Editorial"
                            value={formData.editorial}
                            onChange={(e) =>
                                setFormData({ ...formData, editorial: e.target.value })
                            }
                            required
                        />


                        <input
                            placeholder="ISBN"
                            value={formData.isbn}
                            onChange={(e) =>
                                setFormData({ ...formData, isbn: e.target.value })
                            }
                            required
                        />

                        <input
                            placeholder="Categoría"
                            value={formData.genre}
                            onChange={(e) =>
                                setFormData({ ...formData, genre: e.target.value })
                            }
                        />

                        <input
                            placeholder="Ubicación"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                        />

                        <input
                            type="number"
                            min={0}
                            placeholder="Stock"
                            value={formData.available_quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, available_quantity: Number(e.target.value) })
                            }
                        />

                        <input
                            type="number"
                            min={0}
                            placeholder="año de publicacion"
                            value={formData.publication_year}
                            onChange={(e) =>
                                setFormData({ ...formData, publication_year: Number(e.target.value) })
                            }
                        />         
                        
                        <div className="cover-upload-field">
                            <label className="cover-upload-btn">
                                <span>{uploading ? "Subiendo..." : "Elegir imagen"}</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleCoverChange}
                                    disabled={uploading}
                                />
                            </label>

                            {formData.cover && (
                                <img
                                    src={getCoverUrl(formData.cover)}
                                    alt="Vista previa de la portada"
                                    className="cover-preview"
                                />
                            )}

                            {uploading && <span className="cover-upload-status">Subiendo portada...</span>}
                            {uploadError && <span className="cover-upload-error">{uploadError}</span>}
                        </div>

                        </div>

                        <div className="modal-actions">
                            <Dialog.Close asChild>
                                <button type="button" className="inv-btn inv-btn--ghost">
                                Cancelar
                                </button>
                            </Dialog.Close>

                            <button type="submit" className="inv-btn inv-btn--primary" disabled={uploading}>
                                Guardar
                            </button>
                        </div>

                    </form>

                </Dialog.Content>
            </Dialog.Portal>

        </Dialog.Root>
    )
}