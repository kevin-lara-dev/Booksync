import { createContext, useContext, useMemo, useState } from "react";
import { loginRequest } from "../services/auth.service";

// contexto global de auth — cualquier componente que necesite saber si el usuario está logueado lo consume
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // leo el localStorage al arrancar pa que la sesión no se pierda si recargo la página
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token"));

  // llama al servicio, guarda token y usuario en localStorage y actualiza el estado
  const login = async (data) => {
    const response = await loginRequest(data);
    const { user, token } = response;

    //guardamos token — a partir de aqui el interceptor de api.js lo incluye en cada petición
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setCurrentUser(user);
  };

  // limpia localStorage y resetea el estado — la app queda como si nadie estuviera logueado
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
  };

  // useMemo pa que el objeto no se recree en cada render y cause re-renders innecesarios
  const value = useMemo(() => {
    return {
      currentUser,
      token,
      login,
      logout,
      isAuthenticated: !!token,                        // true si hay token
      isAdmin: currentUser?.role === "administrador",  // true si el rol es admin
    };
  }, [currentUser, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// hook pa consumir el contexto — lanza error claro si lo uso fuera del AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
