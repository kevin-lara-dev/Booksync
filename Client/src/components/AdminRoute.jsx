import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  // Si no está autenticado, lo mando al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si NO es admin, lo mando al home
  if (!isAdmin) {
    return <Navigate to="/Home" replace />;
  }
  // Si sí es admin, muestro la vista
  return children;
}
