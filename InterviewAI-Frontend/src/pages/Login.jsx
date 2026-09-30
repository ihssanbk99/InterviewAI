import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(form.email, form.password);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.email?.[0] ||
                    "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="ai-corner ai-corner-top-left">
                    <div className="ai-corner-core">AI</div>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <i></i>
                    <i></i>
                    <i></i>
                </div>

                <div className="ai-corner ai-corner-top-right">
                    <div className="ai-corner-core">AI</div>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <i></i>
                    <i></i>
                    <i></i>
                </div>

                <div className="ai-corner ai-corner-bottom-left">
                    <div className="ai-corner-core">AI</div>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <i></i>
                    <i></i>
                    <i></i>
                </div>

                <div className="ai-corner ai-corner-bottom-right">
                    <div className="ai-corner-core">AI</div>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <i></i>
                    <i></i>
                    <i></i>
                </div>
            </div>

            <div className="login-container">
                <div className="login-brand">
                    <div className="login-logo">AI</div>

                    <div>
                        <strong>InterviewAI</strong>
                        <span>AI-Powered Interview Coach</span>
                    </div>
                </div>

                <div className="login-card">
                    <div className="login-card-header">
                        <span className="login-eyebrow">
                            WELCOME BACK
                        </span>

                        <h1>
                            Ready to
                            <span> practice?</span>
                        </h1>

                        <p>
                            Sign in to continue your interview preparation
                            and track your progress.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="login-form-group">
                            <label htmlFor="email">Email Address</label>

                            <div className="login-input-wrapper">
                                <span className="login-input-icon">
                                    @
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label htmlFor="password">Password</label>

                            <div className="login-input-wrapper">
                                <span className="login-input-icon">
                                    •
                                </span>

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="login-submit"
                            type="submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </span>

                            {!loading && <span>→</span>}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <div className="login-register">
                        <span>Don't have an account?</span>

                        <Link to="/register">
                            Create Account
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                <div className="login-footer">
                    <span></span>
                    <p>INTERVIEWAI SYSTEM</p>
                    <span></span>
                </div>
            </div>
        </div>
    );
}