import { Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";

function Home() {
    return (
        <div>
            <h1>InterviewAI</h1>
            <p>AI-powered interview practice.</p>

            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interview-setup" element={<InterviewSetup />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview-history" element={<InterviewHistory />} />
        </Routes>
    );
}