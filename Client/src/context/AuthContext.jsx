import { createContext, useContext, useMemo, useState } from "react";
import { loginRequest } from "../services/auth.service";

// Contexto global de autenticación. Cualquier componente que necesite saber si el usuario está logueado lo consume desde aquí.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Al iniciar la aplicación, recupera la sesión guardada en localStorage para que no se pierda al recargar la página
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token"));

  // Llama al servicio de login, guarda el token y el usuario en localStorage y actualiza el estado.
  // Devuelve el usuario directamente para que Login.jsx pueda leer el rol antes de que React actualice el contexto.
  const login = async (data) => {
    const response = await loginRequest(data);
    const { user, token } = response;

    // Al guardar el token aquí, el interceptor de api.js lo incluye automáticamente en cada petición posterior
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setCurrentUser(user);

    return user;
  };

  // Limpia localStorage y resetea el estado — la app queda como si nadie estuviera logueado
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
  };

  // useMemo evita que el objeto del contexto se recree en cada render, lo que causaría re-renders innecesarios en los componentes que lo consumen
  const value = useMemo(() => {
    return {
      currentUser,
      token,
      login,
      logout,
      isAuthenticated: !!token, // true si hay token
      isAdmin: currentUser?.role === "administrador", // true si el rol es admin
      // true si es admin o bibliotecario , acceso a la operación diaria (reservas y préstamos)
      isStaff:
        currentUser?.role === "administrador" ||
        currentUser?.role === "bibliotecario",
    };
  }, [currentUser, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para consumir el contexto de autenticación desde cualquier componente. Lanza un error si se usa fuera del AuthProvider.
// eslint-disable-next-line react-refresh/only-export-components -- el hook vive junto a su Provider a propósito, es el patrón estándar de contexto
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
