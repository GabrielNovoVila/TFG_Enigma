const API_URL = "http://localhost:8082";

function notifyAuthChange() {
    window.dispatchEvent(new Event("auth-token-changed"));
}

function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    notifyAuthChange();
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        clearTokens();
        return null;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
        clearTokens();
        return null;
    }

    const data = await response.json();

    if (!data.accessToken) {
        clearTokens();
        return null;
    }

    localStorage.setItem("accessToken", data.accessToken);
    notifyAuthChange();

    return data.accessToken;
}

function buildRequestOptions(options, token) {
    const headers = {
        ...options.headers,
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return {
        ...options,
        headers
    };
}

export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(url, buildRequestOptions(options, token));

    if (response.status !== 401 || url.includes("/auth/refresh")) {
        return response;
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
        return response;
    }

    return fetch(url, buildRequestOptions(options, newAccessToken));
}
