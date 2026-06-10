import { useState } from "react";

// hook pa mostrar toasts de feedback — lo uso en casi todas las páginas
// uso: const { toast, showToast } = useToast()
//      showToast("Error", "algo salió mal")  → toast rojo
//      showToast("Listo", "guardado")        → toast verde
export function useToast() {
  const [state, setState] = useState({ show: false, title: "", msg: "" });

  // muestra el toast y lo oculta solo después de 3 segundos
  const showToast = (title, msg) => {
    setState({ show: true, title, msg });
    setTimeout(() => setState({ show: false, title: "", msg: "" }), 3000);
  };

  // cierre manual cuando el usuario toca la X
  const dismiss = () => setState({ show: false, title: "", msg: "" });

  // si el título es "Error" muestro X roja, cualquier otro caso muestro ✓ verde
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
