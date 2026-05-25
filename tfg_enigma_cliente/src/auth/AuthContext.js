// src/auth/AuthContext.jsx
import { createContext, useCallback, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const login = useCallback((access, refresh) => {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        setAccessToken(access);
    }, []);

    const [accessToken, setAccessToken] = useState(() => {
        return localStorage.getItem("accessToken");
    });

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
