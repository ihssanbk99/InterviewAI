import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./InterviewHistory.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInterview, setSelectedInterview] = useState(null);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const token = localStorage.getItem("interviewai_token");

                const response = await axios.get(`${API_URL}/interviews`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setInterviews(response.data.interviews);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load interview history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getScoreClass = (score) => {
        if (score >= 8) {
            return "score-excellent";
        }

        if (score >= 6) {
            return "score-good";
        }

        return "score-low";
    };

    if (loading) {
        return (
            <div className="history-page">
                <div className="history-background">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="history-loading">
                    <div className="loading-orbit">
                        <div></div>
                    </div>
                    <p>Loading AI sessions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-background">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="history-content">
                <header className="history-header">
                    <div className="history-heading">
                        <div className="ai-status">
                            <span></span>
                            AI SYSTEM ONLINE
                        </div>

                        <h1>
                            Interview
                            <span> History</span>
                        </h1>

                        <p>
                            Review your previous AI-powered interview
                            sessions and track your progress.
                        </p>
                    </div>

                    <Link
                        to="/interview-setup"
                        className="new-interview-button"
                    >
                        <span>+</span>
                        New Interview
                    </Link>
                </header>

                {error && (
                    <div className="history-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {!error && interviews.length === 0 && (
                    <div className="empty-history">
                        <div className="empty-icon">AI</div>
                        <h2>No Interview Sessions</h2>
                        <p>
                            Start your first AI interview and your results
                            will appear here.
                        </p>

                        <Link to="/interview-setup">
                            Start Your First Interview
                        </Link>
                    </div>
                )}

                {!error && interviews.length > 0 && (
                    <>
                        <div className="history-summary">
                            <div className="summary-card">
                                <div className="summary-icon">◉</div>
                                <div>
                                    <span>Total Sessions</span>
                                    <strong>{interviews.length}</strong>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon">✦</div>
                                <div>
                                    <span>Average Score</span>
                                    <strong>
                                        {(
                                            interviews.reduce(
                                                (total, interview) =>
                                                    total + interview.score,
                                                0
                                            ) / interviews.length
                                        ).toFixed(1)}
                                        <small>/10</small>
                                    </strong>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon">↗</div>
                                <div>
                                    <span>Latest Session</span>
                                    <strong>
                                        {formatDate(
                                            interviews[0].created_at
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="session-section">
                            <div className="section-heading">
                                <div>
                                    <span>AI ANALYTICS</span>
                                    <h2>Your Interview Sessions</h2>
                                </div>

                                <div className="session-count">
                                    {interviews.length}{" "}
                                    {interviews.length === 1
                                        ? "SESSION"
                                        : "SESSIONS"}
                                </div>
                            </div>

                            <div className="session-grid">
                                {interviews.map((interview, index) => (
                                    <article
                                        className="session-card"
                                        key={interview.id}
                                        style={{
                                            animationDelay: `${index * 0.08}s`,
                                        }}
                                    >
                                        <div className="card-glow"></div>

                                        <div className="session-top">
                                            <div className="session-number">
                                                <span>SESSION</span>
                                                <strong>
                                                    #{String(
                                                        interview.id
                                                    ).padStart(2, "0")}
                                                </strong>
                                            </div>

                                            <div
                                                className={`session-score ${getScoreClass(
                                                    interview.score
                                                )}`}
                                            >
                                                <strong>
                                                    {interview.score}
                                                </strong>
                                                <span>/10</span>
                                            </div>
                                        </div>

                                        <div className="session-main">
                                            <div className="session-type">
                                                <span className="type-dot"></span>
                                                {interview.interview_type}
                                            </div>

                                            <h3>{interview.level}</h3>

                                            <div className="session-meta">
                                                <span>
                                                    {formatDate(
                                                        interview.created_at
                                                    )}
                                                </span>
                                                <span>•</span>
                                                <span>AI Evaluated</span>
                                            </div>
                                        </div>

                                        <div className="session-footer">
                                            <button
                                                onClick={() =>
                                                    setSelectedInterview(
                                                        interview
                                                    )
                                                }
                                            >
                                                View Analysis
                                                <span>→</span>
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedInterview && (
                <div
                    className="analysis-overlay"
                    onClick={() => setSelectedInterview(null)}
                >
                    <div
                        className="analysis-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="modal-close"
                            onClick={() => setSelectedInterview(null)}
                        >
                            ×
                        </button>

                        <div className="modal-header">
                            <div>
                                <div className="modal-label">
                                    AI INTERVIEW ANALYSIS
                                </div>

                                <h2>
                                    {selectedInterview.interview_type}
                                </h2>

                                <p>
                                    {selectedInterview.level} ·{" "}
                                    {formatDate(
                                        selectedInterview.created_at
                                    )}
                                </p>
                            </div>

                            <div
                                className={`modal-score ${getScoreClass(
                                    selectedInterview.score
                                )}`}
                            >
                                <strong>{selectedInterview.score}</strong>
                                <span>/10</span>
                            </div>
                        </div>

                        <div className="analysis-question">
                            <span>INTERVIEW QUESTION</span>
                            <p>{selectedInterview.question}</p>
                        </div>

                        <div className="analysis-answer">
                            <span>YOUR ANSWER</span>
                            <p>{selectedInterview.answer}</p>
                        </div>

                        <div className="analysis-grid">
                            <div className="analysis-box strengths-box">
                                <div className="analysis-box-title">
                                    <span>+</span>
                                    Strengths
                                </div>

                                <ul>
                                    {selectedInterview.strengths?.map(
                                        (strength, index) => (
                                            <li key={index}>{strength}</li>
                                        )
                                    )}
                                </ul>
                            </div>

                            <div className="analysis-box weaknesses-box">
                                <div className="analysis-box-title">
                                    <span>↗</span>
                                    Areas to Improve
                                </div>

                                <ul>
                                    {selectedInterview.weaknesses?.map(
                                        (weakness, index) => (
                                            <li key={index}>{weakness}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="ai-feedback">
                            <div className="feedback-label">
                                <span>✦</span>
                                AI COACH FEEDBACK
                            </div>

                            <p>{selectedInterview.feedback}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}