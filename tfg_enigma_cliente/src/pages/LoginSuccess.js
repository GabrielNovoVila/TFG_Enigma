// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginSuccess() {
    const [params] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const access = params.get("access");
        const refresh = params.get("refresh");

        if (access && refresh) {
            login(access, refresh);
            window.location.href = "/";
        }
    }, [login, params]);

    return null;
}
