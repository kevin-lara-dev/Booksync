import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Envuelve las rutas privadas para bloquear el acceso si el usuario no tiene sesión activa.
// Uso: <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
export function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // replace evita que el usuario pueda regresar al login usando el botón atrás del navegador
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
