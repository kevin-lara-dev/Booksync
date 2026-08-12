import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Igual que AdminRoute, pero también deja pasar al rol bibliotecario.
// Uso: rutas de operación diaria (Reservas, Préstamos) que administrador y bibliotecario pueden gestionar.
export function StaffRoute({ children }) {
  const { isAuthenticated, isStaff } = useAuth();

  // Si no hay sesión activa, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está logueado pero no es admin ni bibliotecario, lo manda al inicio de usuario
  if (!isStaff) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}
