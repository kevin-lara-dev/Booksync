import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Igual que PrivateRoute, pero además verifica que el usuario tenga rol de administrador.
// Uso: <Route path="/Admin/..." element={<AdminRoute><PaginaAdmin /></AdminRoute>} />
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Si no hay sesión activa, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está logueado pero no es admin, lo manda al inicio de usuario, no al login
  if (!isAdmin) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}
