import { useState } from "react";

// Hook para mostrar notificaciones (toasts) de feedback al usuario. Se usa en casi todas las páginas.
// Uso: const { toast, showToast } = useToast()
//      showToast("Error", "algo salió mal")  → toast rojo
//      showToast("Listo", "guardado")        → toast verde
export function useToast() {
  const [state, setState] = useState({ show: false, title: "", msg: "" });

  // Muestra el toast y lo oculta automáticamente después de 3 segundos
  const showToast = (title, msg) => {
    setState({ show: true, title, msg });
    setTimeout(() => setState({ show: false, title: "", msg: "" }), 3000);
  };

  // Cierre manual cuando el usuario toca la X
  const dismiss = () => setState({ show: false, title: "", msg: "" });

  // Si el título es "Error" muestra ✗ roja, en cualquier otro caso muestra ✓ verde
  const isError = state.title === "Error";

  const toast = (
    <div
      className={"reserve-toast" + (state.show ? "" : " hidden")}
      role="status"
      aria-live="polite"
    >
      <div className="toast-content">
        <i className={`fa-solid ${isError ? "fa-circle-xmark" : "fa-circle-check"}`} />
        <div>
          <p className="toast-title">{state.title}</p>
          <p className="toast-msg">{state.msg}</p>
        </div>
      </div>
      <button type="button" onClick={dismiss}>
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );

  return { toast, showToast };
}
