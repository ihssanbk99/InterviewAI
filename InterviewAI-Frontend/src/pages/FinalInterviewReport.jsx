import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./FinalInterviewReport.css";

const API_URL = "http://127.0.0.1:8000/api";

const criteriaLabels = [
    {
        key: "technical_accuracy",
        label: "Technical Accuracy",
    },
    {
        key: "relevance",
        label: "Relevance",
    },
    {
        key: "completeness",
        label: "Completeness",
    },
    {
        key: "clarity_communication",
        label: "Clarity & Communication",
    },
    {
        key: "experience_level_fit",
        label: "Experience-Level Fit",
    },
];

const getScoreColor = (score) => {
    if (score >= 8) {
        return "#35d07f";
    }

    if (score >= 6) {
        return "#b8d94b";
    }

    if (score >= 4) {
        return "#f2b84b";
    }

    return "#ef5b67";
};

const getSafeScore = (value) => {
    const score = Number(value ?? 0);

    if (Number.isNaN(score)) {
        return 0;
    }

    return Math.min(10, Math.max(0, score));
};

const calculateAverage = (interviews, key) => {
    if (!interviews.length) {
        return 0;
    }

    const total = interviews.reduce((sum, interview) => {
        return sum + getSafeScore(interview[key]);
    }, 0);

    return Number((total / interviews.length).toFixed(1));
};

export default function FinalInterviewReport() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token =
                    localStorage.getItem(
                        "interviewai_token"
                    );

                const response = await axios.get(
                    `${API_URL}/interview/report/${sessionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setReport(response.data.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load the interview report."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="final-report-page">
                <div className="final-report-loading">
                    <div className="report-loader"></div>

                    <span>
                        Preparing your final
                        interview report...
                    </span>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="final-report-page">
                <div className="final-report-error">
                    <div className="report-error-icon">
                        !
                    </div>

                    <div className="report-status">
                        REPORT UNAVAILABLE
                    </div>

                    <h1>
                        Unable to Load Report
                    </h1>

                    <p>
                        {error ||
                            "The interview report could not be found."}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                        <span>→</span>
                    </button>
                </div>
            </div>
        );
    }

    const overallAnalysis =
        report.overall_analysis || {};

    const interviews =
        report.interviews || [];

    const criteriaAverages =
        criteriaLabels.map((criterion) => ({
            ...criterion,
            score: calculateAverage(
                interviews,
                criterion.key
            ),
        }));

    const averageCriteriaScore =
        criteriaAverages.length
            ? (
                  criteriaAverages.reduce(
                      (sum, criterion) =>
                          sum + criterion.score,
                      0
                  ) /
                  criteriaAverages.length
              ).toFixed(1)
            : "0.0";

    return (
        <div className="final-report-page">
            <div className="final-report-background">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="final-report-container">
                <header className="final-report-header">
                    <div>
                        <div className="report-status">
                            INTERVIEW COMPLETE
                        </div>

                        <h1>
                            Final Interview Report
                        </h1>

                        <p>
                            Your AI-powered performance
                            analysis
                        </p>
                    </div>

                    <button
                        className="report-dashboard-button"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Dashboard
                        <span>→</span>
                    </button>
                </header>

                <section className="report-summary">
                    <div className="score-section">
                        <div className="score-label">
                            OVERALL SCORE
                        </div>

                        <div className="score-value">
                            {Number(
                                report.final_score
                            ).toFixed(2)}
                        </div>

                        <div className="score-total">
                            /10
                        </div>
                    </div>

                    <div className="summary-details">
                        <div className="summary-item">
                            <span>
                                INTERVIEW TYPE
                            </span>

                            <strong>
                                {
                                    report.interview_type
                                }
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>
                                EXPERIENCE LEVEL
                            </span>

                            <strong>
                                {report.level}
                            </strong>
                        </div>

                        <div className="summary-item">
                            <span>
                                QUESTIONS
                            </span>

                            <strong>
                                {
                                    interviews.length
                                }{" "}
                                /{" "}
                                {
                                    report.total_questions
                                }
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="report-section">
                    <div className="section-heading">
                        <span>
                            01
                        </span>

                        <div>
                            <h2>
                                Interview Analysis
                            </h2>

                            <p>
                                Detailed analysis of
                                each answer
                            </p>
                        </div>
                    </div>

                    <div className="question-analysis-list">
                        {interviews.map(
                            (
                                interview,
                                index
                            ) => (
                                <article
                                    className="analysis-card"
                                    key={
                                        interview.id
                                    }
                                >
                                    <div className="analysis-card-header">
                                        <div className="analysis-question-number">
                                            Q
                                            {String(
                                                index +
                                                    1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </div>

                                        <div className="analysis-score">
                                            <span>
                                                SCORE
                                            </span>

                                            <strong>
                                                {
                                                    interview.score
                                                }
                                                <small>
                                                    /10
                                                </small>
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="analysis-question">
                                        <span>
                                            QUESTION
                                        </span>

                                        <h3>
                                            {
                                                interview.question
                                            }
                                        </h3>
                                    </div>

                                    <div className="analysis-answer">
                                        <span>
                                            YOUR ANSWER
                                        </span>

                                        <p>
                                            {
                                                interview.answer
                                            }
                                        </p>
                                    </div>

                                    <div className="criteria-section">
                                        <div className="criteria-section-header">
                                            <div>
                                                <span>
                                                    AI EVALUATION
                                                </span>

                                                <p>
                                                    Performance across five evaluation criteria
                                                </p>
                                            </div>
                                        </div>

                                        <div className="criteria-grid">
                                            {criteriaLabels.map(
                                                (
                                                    criterion
                                                ) => {
                                                    const value =
                                                        getSafeScore(
                                                            interview[
                                                                criterion
                                                                    .key
                                                            ]
                                                        );

                                                    return (
                                                        <div
                                                            className="criteria-card"
                                                            key={
                                                                criterion.key
                                                            }
                                                        >
                                                            <div className="criteria-card-top">
                                                                <span>
                                                                    {
                                                                        criterion.label
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        value
                                                                    }
                                                                    <small>
                                                                        /10
                                                                    </small>
                                                                </strong>
                                                            </div>

                                                            <div className="criteria-bar">
                                                                <span
                                                                    style={{
                                                                        width: `${value * 10}%`,
                                                                        backgroundColor:
                                                                            getScoreColor(
                                                                                value
                                                                            ),
                                                                    }}
                                                                ></span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    <div className="analysis-grid">
                                        <div className="analysis-box strengths-box">
                                            <div className="analysis-box-title">
                                                <span>
                                                    +
                                                </span>

                                                <strong>
                                                    Strengths
                                                </strong>
                                            </div>

                                            <ul>
                                                {interview.strengths?.map(
                                                    (
                                                        strength,
                                                        strengthIndex
                                                    ) => (
                                                        <li
                                                            key={
                                                                strengthIndex
                                                            }
                                                        >
                                                            {
                                                                strength
                                                            }
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>

                                        <div className="analysis-box weaknesses-box">
                                            <div className="analysis-box-title">
                                                <span>
                                                    −
                                                </span>

                                                <strong>
                                                    Areas to Improve
                                                </strong>
                                            </div>

                                            <ul>
                                                {interview.weaknesses?.map(
                                                    (
                                                        weakness,
                                                        weaknessIndex
                                                    ) => (
                                                        <li
                                                            key={
                                                                weaknessIndex
                                                            }
                                                        >
                                                            {
                                                                weakness
                                                            }
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="analysis-feedback">
                                        <span>
                                            AI FEEDBACK
                                        </span>

                                        <p>
                                            {
                                                interview.feedback
                                            }
                                        </p>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                </section>

                <section className="report-section overall-section">
                    <div className="section-heading">
                        <span>
                            02
                        </span>

                        <div>
                            <h2>
                                Advanced AI Analysis
                            </h2>

                            <p>
                                Gemini analysis across
                                the complete interview
                            </p>
                        </div>
                    </div>

                    <div className="overall-feedback">
                        <div className="overall-feedback-label">
                            PERFORMANCE SUMMARY
                        </div>

                        <p>
                            {
                                overallAnalysis.performance_summary ||
                                report.overall_feedback
                            }
                        </p>
                    </div>

                    <div className="overall-grid">
                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    +
                                </span>

                                <h3>
                                    Key Strengths
                                </h3>
                            </div>

                            <ul>
                                {(
                                    overallAnalysis.key_strengths ||
                                    report.overall_strengths ||
                                    []
                                ).map(
                                    (
                                        strength,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                strength
                                            }
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    −
                                </span>

                                <h3>
                                    Main Weaknesses
                                </h3>
                            </div>

                            <ul>
                                {(
                                    overallAnalysis.main_weaknesses ||
                                    report.overall_weaknesses ||
                                    []
                                ).map(
                                    (
                                        weakness,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                weakness
                                            }
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="overall-grid">
                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    AI
                                </span>

                                <h3>
                                    Technical Performance
                                </h3>
                            </div>

                            <p>
                                {
                                    overallAnalysis.technical_performance ||
                                    "Technical performance analysis is not available."
                                }
                            </p>
                        </div>

                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    AI
                                </span>

                                <h3>
                                    Communication Performance
                                </h3>
                            </div>

                            <p>
                                {
                                    overallAnalysis.communication_performance ||
                                    "Communication performance analysis is not available."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="overall-grid">
                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    LV
                                </span>

                                <h3>
                                    Experience Assessment
                                </h3>
                            </div>

                            <p>
                                {
                                    overallAnalysis.experience_assessment ||
                                    "Experience-level assessment is not available."
                                }
                            </p>
                        </div>

                        <div className="overall-card">
                            <div className="overall-card-title">
                                <span>
                                    ↑
                                </span>

                                <h3>
                                    Areas to Improve
                                </h3>
                            </div>

                            <ul>
                                {(
                                    overallAnalysis.areas_to_improve ||
                                    []
                                ).map(
                                    (
                                        area,
                                        index
                                    ) => (
                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                area
                                            }
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="overall-feedback">
                        <div className="overall-feedback-label">
                            PERSONALIZED ACTION PLAN
                        </div>

                        <ul>
                            {(
                                overallAnalysis.action_plan ||
                                []
                            ).map(
                                (
                                    action,
                                    index
                                ) => (
                                    <li
                                        key={
                                            index
                                        }
                                    >
                                        {action}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </section>

                <section className="report-section charts-section">
                    <div className="section-heading">
                        <span>
                            03
                        </span>

                        <div>
                            <h2>
                                Performance Breakdown
                            </h2>

                            <p>
                                Visual breakdown of your
                                interview performance
                            </p>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-card-header">
                                <div>
                                    <span>
                                        CRITERIA PERFORMANCE
                                    </span>

                                    <h3>
                                        Interview Skill Profile
                                    </h3>
                                </div>

                                <div className="chart-score">
                                    {
                                        averageCriteriaScore
                                    }
                                    <small>
                                        /10
                                    </small>
                                </div>
                            </div>

                            <div className="energy-bars">
                                {criteriaAverages.map(
                                    (criterion) => (
                                        <div
                                            className="energy-bar-item"
                                            key={
                                                criterion.key
                                            }
                                        >
                                            <div className="energy-bar-header">
                                                <span>
                                                    {
                                                        criterion.label
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        criterion.score
                                                    }
                                                    <small>
                                                        /10
                                                    </small>
                                                </strong>
                                            </div>

                                            <div className="energy-bar-track">
                                                <span
                                                    style={{
                                                        width: `${criterion.score * 10}%`,
                                                        backgroundColor:
                                                            getScoreColor(
                                                                criterion.score
                                                            ),
                                                    }}
                                                ></span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-card-header">
                                <div>
                                    <span>
                                        QUESTION SCORES
                                    </span>

                                    <h3>
                                        Performance by Question
                                    </h3>
                                </div>

                                <div className="chart-score">
                                    {Number(
                                        report.final_score
                                    ).toFixed(1)}
                                    <small>
                                        /10
                                    </small>
                                </div>
                            </div>

                            <div className="energy-bars question-bars">
                                {interviews.map(
                                    (
                                        interview,
                                        index
                                    ) => {
                                        const score =
                                            getSafeScore(
                                                interview.score
                                            );

                                        return (
                                            <div
                                                className="energy-bar-item"
                                                key={
                                                    interview.id
                                                }
                                            >
                                                <div className="energy-bar-header">
                                                    <span>
                                                        Q
                                                        {index +
                                                            1}
                                                    </span>

                                                    <strong>
                                                        {score.toFixed(
                                                            1
                                                        )}
                                                        <small>
                                                            /10
                                                        </small>
                                                    </strong>
                                                </div>

                                                <div className="energy-bar-track">
                                                    <span
                                                        style={{
                                                            width: `${score * 10}%`,
                                                            backgroundColor:
                                                                getScoreColor(
                                                                    score
                                                                ),
                                                        }}
                                                    ></span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="final-report-footer">
                    <button
                        onClick={() =>
                            navigate(
                                "/interview-setup"
                            )
                        }
                    >
                        Start New Interview
                        <span>→</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}