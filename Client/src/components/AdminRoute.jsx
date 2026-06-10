import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// igual que PrivateRoute pero además verifica que sea admin
// uso: <Route path="/Admin/..." element={<AdminRoute><PaginaAdmin /></AdminRoute>} />
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // primero verifico sesión, si no hay token mando al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // si está logueado pero no es admin lo mando al home, no al login
  if (!isAdmin) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}
