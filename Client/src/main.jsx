import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import "./styles/style.css";
import "./styles/login.css";
import "./styles/register.css";
import "./styles/home.css";
import "./styles/detalle.css";
import "./styles/help.css";
import "./styles/forgotEmailSent.css";
import "./styles/resetPassword.css";
import "./styles/reservas.css";
import "./styles/prestamos.css";
import "./styles/favoritos.css";
import "./styles/loans.css";
import "./styles/cuenta.css";
import "./styles/toast.css";
import "./styles/ajustes.css";
import "./styles/inventarioAdmin.css";
import "./styles/reservasAdmin.css";
import "./styles/usuariosAdmin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
