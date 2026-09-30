import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
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

        if (form.password !== form.passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await register(
                form.name,
                form.email,
                form.password,
                form.passwordConfirmation
            );

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.response?.data?.errors?.email?.[0] ||
                    "Registration failed. Please check your information."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-background">
                <div className="register-grid"></div>

                <div className="register-orbit register-orbit-one"></div>
                <div className="register-orbit register-orbit-two"></div>
                <div className="register-orbit register-orbit-three"></div>

                <div className="register-core">
                    <div className="register-core-ring register-core-ring-one"></div>
                    <div className="register-core-ring register-core-ring-two"></div>
                    <div className="register-core-ring register-core-ring-three"></div>

                    <div className="register-core-center">
                        <span>AI</span>
                        <small>ENGINE</small>
                    </div>
                </div>

                <div className="register-node register-node-one"></div>
                <div className="register-node register-node-two"></div>
                <div className="register-node register-node-three"></div>
                <div className="register-node register-node-four"></div>
                <div className="register-node register-node-five"></div>
                <div className="register-node register-node-six"></div>
                <div className="register-node register-node-seven"></div>
                <div className="register-node register-node-eight"></div>

                <div className="register-line register-line-one"></div>
                <div className="register-line register-line-two"></div>
                <div className="register-line register-line-three"></div>
                <div className="register-line register-line-four"></div>
                <div className="register-line register-line-five"></div>
                <div className="register-line register-line-six"></div>

                <div className="register-floating-label register-label-one">
                    NEURAL ENGINE
                </div>

                <div className="register-floating-label register-label-two">
                    AI ANALYSIS
                </div>

                <div className="register-floating-label register-label-three">
                    ADAPTIVE LEARNING
                </div>

                <div className="register-floating-label register-label-four">
                    INTERVIEW INTELLIGENCE
                </div>

                <div className="register-particle register-particle-one"></div>
                <div className="register-particle register-particle-two"></div>
                <div className="register-particle register-particle-three"></div>
                <div className="register-particle register-particle-four"></div>
                <div className="register-particle register-particle-five"></div>
                <div className="register-particle register-particle-six"></div>
            </div>

            <div className="register-container">
                <div className="register-brand">
                    <div className="register-logo">AI</div>

                    <div>
                        <strong>InterviewAI</strong>
                        <span>AI-Powered Interview Coach</span>
                    </div>
                </div>

                <div className="register-card">
                    <div className="register-card-header">
                        <span className="register-eyebrow">
                            CREATE YOUR PROFILE
                        </span>

                        <h1>
                            Start your
                            <span> journey.</span>
                        </h1>

                        <p>
                            Create your account and prepare for interviews
                            with intelligent AI-powered feedback.
                        </p>
                    </div>

                    {error && (
                        <div className="register-error">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="register-form-group">
                            <label htmlFor="name">Full Name</label>

                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
                                    ◇
                                </span>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="register-form-group">
                            <label htmlFor="email">Email Address</label>

                            <div className="register-input-wrapper">
                                <span className="register-input-icon">
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

                        <div className="register-form-row">
                            <div className="register-form-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="register-input-wrapper">
                                    <span className="register-input-icon">
                                        •
                                    </span>

                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 8 characters"
                                        autoComplete="new-password"
                                        minLength="8"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label htmlFor="passwordConfirmation">
                                    Confirm Password
                                </label>

                                <div className="register-input-wrapper">
                                    <span className="register-input-icon">
                                        •
                                    </span>

                                    <input
                                        id="passwordConfirmation"
                                        type="password"
                                        name="passwordConfirmation"
                                        value={form.passwordConfirmation}
                                        onChange={handleChange}
                                        placeholder="Repeat password"
                                        autoComplete="new-password"
                                        minLength="8"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            className="register-submit"
                            type="submit"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? "Creating account..."
                                    : "Create Account"}
                            </span>

                            {!loading && <span>→</span>}
                        </button>
                    </form>

                    <div className="register-divider">
                        <span></span>
                        <p>ALREADY A MEMBER?</p>
                        <span></span>
                    </div>

                    <div className="register-login">
                        <span>Already have an account?</span>

                        <Link to="/login">
                            Sign In
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                <div className="register-footer">
                    <span></span>
                    <p>INTERVIEWAI SYSTEM</p>
                    <span></span>
                </div>
            </div>
        </div>
    );
}