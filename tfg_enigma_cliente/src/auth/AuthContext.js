// src/auth/AuthContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";

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

    useEffect(() => {
        const syncAccessToken = () => {
            setAccessToken(localStorage.getItem("accessToken"));
        };

        window.addEventListener("storage", syncAccessToken);
        window.addEventListener("auth-token-changed", syncAccessToken);

        return () => {
            window.removeEventListener("storage", syncAccessToken);
            window.removeEventListener("auth-token-changed", syncAccessToken);
        };
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        window.dispatchEvent(new Event("auth-token-changed"));
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
