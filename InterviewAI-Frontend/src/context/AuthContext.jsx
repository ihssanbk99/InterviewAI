import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = "http://127.0.0.1:8000/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("interviewai_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("interviewai_token");
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios
                .get(`${API_URL}/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setUser(response.data.user);
                    localStorage.setItem(
                        "interviewai_user",
                        JSON.stringify(response.data.user)
                    );
                })
                .catch(() => {
                    localStorage.removeItem("interviewai_token");
                    localStorage.removeItem("interviewai_user");
                    setToken(null);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const register = async (name, email, password, passwordConfirmation) => {
        const response = await axios.post(`${API_URL}/register`, {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });

        const newToken = response.data.token;
        const newUser = response.data.user;

        localStorage.setItem("interviewai_token", newToken);
        localStorage.setItem("interviewai_user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        return response.data;
    };

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });

        const newToken = response.data.token;
        const newUser = response.data.user;

        localStorage.setItem("interviewai_token", newToken);
        localStorage.setItem("interviewai_user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);

        return response.data;
    };

    const logout = async () => {
        try {
            if (token) {
                await axios.post(
                    `${API_URL}/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } finally {
            localStorage.removeItem("interviewai_token");
            localStorage.removeItem("interviewai_user");
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                register,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}