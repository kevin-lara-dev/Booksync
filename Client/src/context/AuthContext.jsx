import { createContext, useContext, useMemo, useState } from "react";
import { loginRequest } from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(localStorage.getItem("token"));


    const login = async (data) => {

        const response = await loginRequest(data);

        const {user, token} = response;

        //guardamos token
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        setToken(token)
        setCurrentUser(user)

    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setCurrentUser(null)
    };



    const value = useMemo(() => {

        return {
            currentUser,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            isAdmin: currentUser?.role === "administrador",
        };
    }, [currentUser, token]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth (){
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return ctx; 
}