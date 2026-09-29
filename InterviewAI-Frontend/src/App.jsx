import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";
import FinalInterviewReport from "./pages/FinalInterviewReport";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
    return (
        <div>
            <h1>InterviewAI</h1>
            <p>AI-powered interview practice.</p>

            <a href="/login">Login</a>
            <a href="/register">Register</a>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/interview-setup"
                element={
                    <ProtectedRoute>
                        <InterviewSetup />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/interview"
                element={
                    <ProtectedRoute>
                        <Interview />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/interview-history"
                element={
                    <ProtectedRoute>
                        <InterviewHistory />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/interview-report/:sessionId"
                element={
                    <ProtectedRoute>
                        <FinalInterviewReport />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}