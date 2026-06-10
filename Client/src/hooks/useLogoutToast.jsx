import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// hook pa el toast de confirmación de cierre de sesión
// diferente a useToast porque este espera que el usuario confirme o cancele
// uso: const { toast, openToast } = useLogoutToast()
//      renderizo {toast} en el jsx y llamo openToast() desde el botón de logout del sidebar
export function useLogoutToast() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const openToast = () => setShowToast(true);

  // el usuario canceló, cierro el toast sin hacer nada
  const closeToast = () => setShowToast(false);

  const confirmLogout = () => {
    navigate("/");
  };

  // si el usuario no toca nada en 5 segundos el toast desaparece solo sin cerrar sesión
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer); // limpio el timer si el componente se desmonta antes
  }, [showToast]);

  const toast = (
    <div
      id="logout-toast"
      className={`toast-logout ${showToast ? "is-visible" : ""}`}
      aria-hidden={showToast ? "false" : "true"}
      role="alertdialog"
      aria-labelledby="logout-title"
      aria-describedby="logout-desc"
    >
      <div className="toast-card">
        <div className="toast-header">
          <span id="logout-title" className="toast-title">
            Cerrar sesión
          </span>
          <button
            className="toast-close"
            type="button"
            aria-label="Cerrar aviso"
            onClick={closeToast}
          >
            &times;
          </button>
        </div>
        <p id="logout-desc" className="toast-desc">
          Estás a punto de cerrar sesión
        </p>
        <div className="toast-actions">
          <button
            id="toast-confirm-logout"
            className="btn-danger"
            type="button"
            onClick={confirmLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );

  return { toast, openToast };
}
