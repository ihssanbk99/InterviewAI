import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const token = localStorage.getItem("interviewai_token");

                const response = await axios.get(`${API_URL}/interviews`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSessions(response.data.sessions || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load your interview data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    const averageScore =
        sessions.length > 0
            ? (
                  sessions.reduce(
                      (total, session) =>
                          total + Number(session.final_score || 0),
                      0
                  ) / sessions.length
              ).toFixed(1)
            : "0.0";

    const latestSession = sessions[0];

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getScoreClass = (score) => {
        if (score >= 8) {
            return "dashboard-score-excellent";
        }

        if (score >= 6) {
            return "dashboard-score-good";
        }

        return "dashboard-score-low";
    };

    const getStatusClass = (status) => {
        if (status === "terminated") {
            return "dashboard-status-terminated";
        }

        return "dashboard-status-completed";
    };

    const getStatusLabel = (status) => {
        if (status === "terminated") {
            return "Terminated";
        }

        return "Completed";
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-background">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <div>
                        <div className="dashboard-status">
                            <span></span>
                            AI SYSTEM ONLINE
                        </div>

                        <h1>
                            Welcome back,{" "}
                            <span>{user?.name}</span>
                        </h1>

                        <p>
                            Keep practicing, improve your answers, and get
                            closer to your next interview success.
                        </p>
                    </div>

                    <button
                        className="dashboard-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </header>

                {error && (
                    <div className="dashboard-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                <section className="dashboard-hero">
                    <div className="hero-content">
                        <div className="hero-label">
                            <span>✦</span>
                            AI INTERVIEW COACH
                        </div>

                        <h2>
                            Ready for your
                            <span> next interview?</span>
                        </h2>

                        <p>
                            Practice realistic interview questions with
                            AI-powered feedback tailored to your role and
                            experience level.
                        </p>

                        <Link
                            to="/interview-setup"
                            className="start-interview-button"
                        >
                            Start New Interview
                            <span>→</span>
                        </Link>
                    </div>

                    <div className="hero-orbit">
                        <div className="orbit-ring orbit-ring-one"></div>
                        <div className="orbit-ring orbit-ring-two"></div>
                        <div className="orbit-core">
                            <span>AI</span>
                        </div>
                    </div>
                </section>

                <section className="dashboard-stats">
                    <div className="dashboard-stat-card">
                        <div className="stat-icon">◉</div>

                        <div>
                            <span>Total Interviews</span>
                            <strong>
                                {loading ? "—" : sessions.length}
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon">✦</div>

                        <div>
                            <span>Average Score</span>
                            <strong>
                                {loading ? "—" : averageScore}
                                <small>/10</small>
                            </strong>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="stat-icon">↗</div>

                        <div>
                            <span>Latest Score</span>
                            <strong>
                                {loading || !latestSession
                                    ? "—"
                                    : Number(
                                          latestSession.final_score || 0
                                      ).toFixed(2)}
                                {!loading && latestSession && (
                                    <small>/10</small>
                                )}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <span>RECENT ACTIVITY</span>
                            <h2>Your Latest Interviews</h2>
                        </div>

                        <Link to="/interview-history">
                            View Full History →
                        </Link>
                    </div>

                    {loading && (
                        <div className="dashboard-loading">
                            <div className="dashboard-loader"></div>
                            <p>Loading your interview data...</p>
                        </div>
                    )}

                    {!loading && sessions.length === 0 && (
                        <div className="dashboard-empty">
                            <div className="dashboard-empty-icon">
                                AI
                            </div>

                            <h3>No interviews yet</h3>

                            <p>
                                Start your first AI-powered interview and
                                your results will appear here.
                            </p>

                            <Link to="/interview-setup">
                                Start Your First Interview
                            </Link>
                        </div>
                    )}

                    {!loading && sessions.length > 0 && (
                        <div className="recent-interviews">
                            {sessions.slice(0, 3).map((session) => (
                                <article
                                    className="recent-interview-card"
                                    key={session.id}
                                >
                                    <div className="recent-interview-main">
                                        <div className="recent-session">
                                            <span>SESSION</span>

                                            <strong>
                                                #
                                                {String(
                                                    session.id
                                                ).padStart(2, "0")}
                                            </strong>
                                        </div>

                                        <div className="recent-info">
                                            <h3>
                                                {session.interview_type}
                                            </h3>

                                            <p>
                                                {session.level}
                                                <span>•</span>
                                                {formatDate(
                                                    session.created_at
                                                )}
                                            </p>

                                            <div
                                                className={`recent-status ${getStatusClass(
                                                    session.status
                                                )}`}
                                            >
                                                <span></span>
                                                {getStatusLabel(
                                                    session.status
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="recent-interview-actions">
                                        <div
                                            className={`recent-score ${getScoreClass(
                                                Number(
                                                    session.final_score || 0
                                                )
                                            )}`}
                                        >
                                            <strong>
                                                {Number(
                                                    session.final_score || 0
                                                ).toFixed(2)}
                                            </strong>

                                            <span>/10</span>
                                        </div>

                                        {session.status === "completed" ? (
                                            <button
                                                className="recent-report-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/interview-report/${session.id}`
                                                    )
                                                }
                                            >
                                                Report
                                                <span>→</span>
                                            </button>
                                        ) : (
                                            <span className="recent-terminated-label">
                                                No Report
                                            </span>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}