import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./InterviewSetup.css";

const API_URL = "http://127.0.0.1:8000/api";

const interviewTypes = [
    {
        value: "Full Stack Developer",
        label: "Full Stack",
        icon: "FS",
        description: "Frontend, backend & APIs",
    },
    {
        value: "Frontend Developer",
        label: "Frontend",
        icon: "FE",
        description: "UI, React & web development",
    },
    {
        value: "Backend Developer",
        label: "Backend",
        icon: "BE",
        description: "APIs, databases & architecture",
    },
    {
        value: "Data Analyst",
        label: "Data Analyst",
        icon: "DA",
        description: "Data, SQL & analytical thinking",
    },
];

const levels = [
    {
        value: "Junior",
        label: "Junior",
        description: "Starting your professional journey",
        number: "01",
    },
    {
        value: "Mid-Level",
        label: "Mid-Level",
        description: "Building solid professional experience",
        number: "02",
    },
    {
        value: "Senior",
        label: "Senior",
        description: "Advanced expertise & leadership",
        number: "03",
    },
];

export default function InterviewSetup() {
    const navigate = useNavigate();

    const [interviewType, setInterviewType] = useState("");
    const [level, setLevel] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStart = async (e) => {
        e.preventDefault();

        if (!interviewType || !level) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("interviewai_token");

            const response = await axios.post(
                `${API_URL}/interview/start`,
                {
                    interview_type: interviewType,
                    level,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const session = response.data.session;

            navigate("/interview", {
                state: {
                    sessionId: session.id,
                    interviewType: session.interview_type,
                    level: session.level,
                },
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to start the interview."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="interview-setup-page">
            <div className="setup-background">
                <div className="setup-grid"></div>

                <div className="setup-glow setup-glow-one"></div>
                <div className="setup-glow setup-glow-two"></div>

                <div className="setup-orbit setup-orbit-one"></div>
                <div className="setup-orbit setup-orbit-two"></div>

                <div className="setup-node setup-node-one"></div>
                <div className="setup-node setup-node-two"></div>
                <div className="setup-node setup-node-three"></div>
                <div className="setup-node setup-node-four"></div>
                <div className="setup-node setup-node-five"></div>
                <div className="setup-node setup-node-six"></div>

                <div className="setup-line setup-line-one"></div>
                <div className="setup-line setup-line-two"></div>
                <div className="setup-line setup-line-three"></div>
                <div className="setup-line setup-line-four"></div>
            </div>

            <main className="interview-setup-container">
                <header className="setup-header">
                    <div className="setup-brand">
                        <div className="setup-brand-icon">AI</div>

                        <div>
                            <strong>InterviewAI</strong>
                            <span>INTERVIEW PREPARATION SYSTEM</span>
                        </div>
                    </div>

                    <div className="setup-status">
                        <span className="setup-status-dot"></span>
                        AI ENGINE READY
                    </div>
                </header>

                <section className="setup-card">
                    <div className="setup-card-top">
                        <div>
                            <span className="setup-eyebrow">
                                INTERVIEW CONFIGURATION
                            </span>

                            <h1>
                                Build your
                                <span> interview.</span>
                            </h1>

                            <p>
                                Configure your interview experience and let
                                AI create a personalized technical session.
                            </p>
                        </div>

                        <div className="setup-question-count">
                            <strong>05</strong>
                            <span>QUESTIONS</span>
                        </div>
                    </div>

                    {error && (
                        <div className="setup-error">
                            <span>!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleStart}>
                        <div className="setup-section">
                            <div className="setup-section-heading">
                                <div className="setup-section-number">
                                    01
                                </div>

                                <div>
                                    <h2>Choose your interview</h2>
                                    <p>
                                        Select the role you want to practice
                                    </p>
                                </div>
                            </div>

                            <div className="setup-type-grid">
                                {interviewTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`setup-type-card ${
                                            interviewType === type.value
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setInterviewType(type.value)
                                        }
                                        disabled={loading}
                                    >
                                        <div className="setup-type-icon">
                                            {type.icon}
                                        </div>

                                        <div className="setup-type-content">
                                            <strong>{type.label}</strong>
                                            <span>{type.description}</span>
                                        </div>

                                        <div className="setup-selection">
                                            <span></span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setup-section">
                            <div className="setup-section-heading">
                                <div className="setup-section-number">
                                    02
                                </div>

                                <div>
                                    <h2>Choose your level</h2>
                                    <p>
                                        Tell the AI how challenging the
                                        interview should be
                                    </p>
                                </div>
                            </div>

                            <div className="setup-level-grid">
                                {levels.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`setup-level-card ${
                                            level === item.value
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setLevel(item.value)
                                        }
                                        disabled={loading}
                                    >
                                        <span className="setup-level-number">
                                            {item.number}
                                        </span>

                                        <div>
                                            <strong>{item.label}</strong>
                                            <span>
                                                {item.description}
                                            </span>
                                        </div>

                                        <span className="setup-level-check">
                                            ✓
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setup-bottom">
                            <div className="setup-summary">
                                <div className="setup-summary-icon">
                                    AI
                                </div>

                                <div>
                                    <span>SESSION READY</span>
                                    <strong>
                                        {interviewType ||
                                            "Select interview type"}
                                        {" • "}
                                        {level || "Select level"}
                                    </strong>
                                </div>
                            </div>

                            <button
                                className="setup-start-button"
                                type="submit"
                                disabled={
                                    loading ||
                                    !interviewType ||
                                    !level
                                }
                            >
                                <span>
                                    {loading
                                        ? "Starting..."
                                        : "Start Interview"}
                                </span>

                                {!loading && <span>→</span>}
                            </button>
                        </div>
                    </form>
                </section>

                <footer className="setup-footer">
                    <span></span>
                    <p>
                        INTERVIEWAI SYSTEM
                    </p>
                    <span></span>
                </footer>
            </main>
        </div>
    );
}