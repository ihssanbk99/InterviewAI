import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000/api";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const testInterviews = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("interviewai_token");

            const response = await axios.get(`${API_URL}/interviews`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Interview History:", response.data);
        } catch (error) {
            console.error("Unable to load interviews:", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <h1>Welcome, {user?.name}</h1>
            <p>Ready to practice your next interview?</p>

            <Link to="/interview-setup">
                Start New Interview
            </Link>

            <button onClick={testInterviews} disabled={loading}>
                {loading ? "Loading..." : "Test Interview History"}
            </button>

            <button onClick={logout}>Logout</button>
        </div>
    );
}