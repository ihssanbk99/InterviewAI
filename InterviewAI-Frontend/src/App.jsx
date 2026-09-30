import { Route, Routes, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";
import FinalInterviewReport from "./pages/FinalInterviewReport";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function Home() {
    return (
        <div className="home-page">
            <div className="home-background">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <header className="home-navbar">
                <Link to="/" className="home-logo">
                    <span className="home-logo-mark">AI</span>
                    <span>InterviewAI</span>
                </Link>

                <div className="home-nav-actions">
                    <Link to="/login" className="home-login-link">
                        Login
                    </Link>

                    <Link to="/register" className="home-register-button">
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="home-content">
                <section className="home-hero">
                    <div className="home-badge">
                        <span></span>
                        AI-POWERED INTERVIEW PRACTICE
                    </div>

                    <h1>
                        Practice Interviews.
                        <br />
                        <span>Build Confidence.</span>
                    </h1>

                    <p>
                        Prepare for your next job interview with realistic
                        AI-powered interviews, intelligent feedback, and
                        detailed performance analysis.
                    </p>

                    <div className="home-actions">
                        <Link to="/register" className="home-primary-button">
                            Start Practicing
                            <span>→</span>
                        </Link>

                        <Link to="/login" className="home-secondary-button">
                            Sign In
                        </Link>
                    </div>

                    <div className="home-trust">
                        <span className="home-trust-line"></span>
                        <span>Practice smarter. Interview better.</span>
                        <span className="home-trust-line"></span>
                    </div>
                </section>

                <section className="home-preview">
                    <div className="preview-glow"></div>

                    <div className="preview-window">
                        <div className="preview-topbar">
                            <div className="preview-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <span className="preview-title">
                                Interview Session
                            </span>

                            <span className="preview-status">
                                LIVE
                            </span>
                        </div>

                        <div className="preview-body">
                            <div className="preview-question-label">
                                QUESTION 03 / 05
                            </div>

                            <h2>
                                Tell me about a challenging technical problem
                                you solved.
                            </h2>

                            <div className="preview-answer">
                                <span className="preview-mic">●</span>
                                <span>Answering...</span>
                                <div className="preview-wave">
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                </div>
                            </div>

                            <div className="preview-progress">
                                <div>
                                    <span>Interview Progress</span>
                                    <strong>60%</strong>
                                </div>

                                <div className="preview-progress-track">
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-features">
                    <div className="home-feature">
                        <div className="feature-icon">✦</div>
                        <div>
                            <h3>AI Evaluation</h3>
                            <p>
                                Get detailed feedback based on multiple
                                interview criteria.
                            </p>
                        </div>
                    </div>

                    <div className="home-feature">
                        <div className="feature-icon">◈</div>
                        <div>
                            <h3>Realistic Practice</h3>
                            <p>
                                Experience structured interview sessions
                                tailored to your level.
                            </p>
                        </div>
                    </div>

                    <div className="home-feature">
                        <div className="feature-icon">↗</div>
                        <div>
                            <h3>Track Progress</h3>
                            <p>
                                Review previous interviews and understand
                                where you can improve.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="home-footer">
                <span>InterviewAI</span>
                <span>AI-powered interview preparation</span>
            </footer>
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