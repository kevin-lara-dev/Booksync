import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// envuelvo las rutas privadas con esto pa bloquear el acceso si no hay sesión
// uso: <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
export function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // replace pa que el usuario no pueda volver con el botón atrás del navegador al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
