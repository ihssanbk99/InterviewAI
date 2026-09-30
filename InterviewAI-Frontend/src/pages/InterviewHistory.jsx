import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./InterviewHistory.css";

const API_URL = "http://127.0.0.1:8000/api";

function InterviewHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("interviewai_token");

                const response = await axios.get(`${API_URL}/interviews`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSessions(response.data.sessions || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load interview history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatStatus = (status) => {
        if (status === "completed") {
            return "Completed";
        }

        if (status === "terminated") {
            return "Terminated";
        }

        if (status === "in_progress") {
            return "In Progress";
        }

        return status;
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

    const completedSessions = sessions.filter(
        (session) => session.status === "completed"
    );

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

    const latestScore =
        sessions.length > 0
            ? Number(sessions[0].final_score || 0).toFixed(1)
            : "0.0";

    if (loading) {
        return (
            <div className="history-page">
                <div className="history-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading interview history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-container">
                <div className="history-header">
                    <div>
                        <p className="history-eyebrow">PERFORMANCE CENTER</p>
                        <h1>Interview History</h1>
                        <p>
                            Review your previous AI interview sessions and
                            track your progress.
                        </p>
                    </div>

                    <Link
                        to="/interview-setup"
                        className="history-new-interview"
                    >
                        New Interview
                    </Link>
                </div>

                {error && (
                    <div className="history-error">
                        {error}
                    </div>
                )}

                {sessions.length > 0 && (
                    <div className="history-summary">
                        <div className="summary-card">
                            <span className="summary-label">
                                Total Sessions
                            </span>
                            <strong>{sessions.length}</strong>
                        </div>

                        <div className="summary-card">
                            <span className="summary-label">
                                Average Score
                            </span>
                            <strong>{averageScore}/10</strong>
                        </div>

                        <div className="summary-card">
                            <span className="summary-label">
                                Latest Score
                            </span>
                            <strong>{latestScore}/10</strong>
                        </div>
                    </div>
                )}

                {sessions.length === 0 && !error ? (
                    <div className="history-empty">
                        <div className="empty-icon">◈</div>
                        <h2>No Interview Sessions Yet</h2>
                        <p>
                            Complete your first AI interview to see your
                            performance history here.
                        </p>

                        <Link
                            to="/interview-setup"
                            className="empty-action"
                        >
                            Start Your First Interview
                        </Link>
                    </div>
                ) : (
                    <div className="session-grid">
                        {sessions.map((session) => {
                            const score = Number(
                                session.final_score || 0
                            );

                            const questionCount =
                                session.interviews?.length || 0;

                            const totalQuestions =
                                session.total_questions || 5;

                            const isCompleted =
                                session.status === "completed";

                            const isTerminated =
                                session.status === "terminated";

                            return (
                                <div
                                    className="session-card"
                                    key={session.id}
                                >
                                    <div className="session-card-top">
                                        <div>
                                            <span className="session-number">
                                                SESSION #{session.id}
                                            </span>

                                            <h2>
                                                {session.interview_type}
                                            </h2>
                                        </div>

                                        <div
                                            className={`session-score ${getScoreClass(
                                                score
                                            )}`}
                                        >
                                            <strong>{score}</strong>
                                            <span>/10</span>
                                        </div>
                                    </div>

                                    <div className="session-details">
                                        <div className="detail-item">
                                            <span>Level</span>
                                            <strong>
                                                {session.level}
                                            </strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Date</span>
                                            <strong>
                                                {formatDate(
                                                    session.created_at
                                                )}
                                            </strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Questions</span>
                                            <strong>
                                                {questionCount}/
                                                {totalQuestions}
                                            </strong>
                                        </div>

                                        <div className="detail-item">
                                            <span>Status</span>
                                            <strong
                                                className={`session-status status-${session.status}`}
                                            >
                                                {formatStatus(
                                                    session.status
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {isTerminated && (
                                        <div className="violation-message">
                                            <span>!</span>
                                            <div>
                                                <strong>
                                                    Integrity Violation
                                                </strong>
                                                <p>
                                                    This interview was
                                                    terminated before
                                                    completion.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="session-footer">
                                        {isCompleted ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/interview-report/${session.id}`
                                                    )
                                                }
                                            >
                                                View Full Report
                                                <span>→</span>
                                            </button>
                                        ) : isTerminated ? (
                                            <div className="terminated-label">
                                                Interview Terminated
                                            </div>
                                        ) : (
                                            <div className="progress-label">
                                                Interview In Progress
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {completedSessions.length > 0 && (
                    <div className="history-footer">
                        <p>
                            Your completed sessions contain detailed
                            AI-generated performance reports.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterviewHistory;