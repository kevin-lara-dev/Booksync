import { useState } from "react";

//  Hook reutilizable para mostrar toasts
export function useToast() {
  const [state, setState] = useState({ show: false, title: "", msg: "" });

  const showToast = (title, msg) => {
    setState({ show: true, title, msg });
    setTimeout(() => setState({ show: false, title: "", msg: "" }), 3000);
  };

  const dismiss = () => setState({ show: false, title: "", msg: "" });

  const isError = state.title === "Error";

  const toast = (
    <div
      className={"reserve-toast" + (state.show ? "" : " hidden")}
      role="status"
      aria-live="polite"
    >
      <div className="toast-content">
        <i
          className={`fa-solid ${isError ? "fa-circle-xmark" : "fa-circle-check"}`}
        />
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
