// src/services/api.js
export async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem("accessToken");

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
    }