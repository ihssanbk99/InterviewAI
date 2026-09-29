import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export default function Interview() {
    const location = useLocation();
    const navigate = useNavigate();

    const { interviewType, level } = location.state || {};

    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const question = `Tell me about yourself and your experience in ${interviewType?.toLowerCase()}.`;

    if (!interviewType || !level) {
        return (
            <div>
                <h1>Interview Not Found</h1>
                <button onClick={() => navigate("/interview-setup")}>
                    Start New Interview
                </button>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!answer.trim()) {
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const token = localStorage.getItem("interviewai_token");

            const response = await axios.post(
                `${API_URL}/interview/submit-answer`,
                {
                    interview_type: interviewType,
                    level,
                    question,
                    answer,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setResult(response.data.data.evaluation);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to evaluate your answer."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="interview-page">
            <div className="interview-header">
                <div>
                    <h1>{interviewType} Interview</h1>
                    <p>Level: {level}</p>
                </div>
            </div>

            <div className="question-card">
                <span>Question 1</span>

                <h2>{question}</h2>

                {!result && (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            rows="8"
                        />

                        <button
                            type="submit"
                            disabled={!answer.trim() || loading}
                        >
                            {loading ? "AI is evaluating..." : "Submit Answer"}
                        </button>
                    </form>
                )}

                {error && <div className="auth-error">{error}</div>}

                {result && (
                    <div className="evaluation-card">
                        <div className="evaluation-score">
                            <span>Your Score</span>
                            <strong>{result.score}/10</strong>
                        </div>

                        <div className="evaluation-section">
                            <h3>Strengths</h3>

                            <ul>
                                {result.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="evaluation-section">
                            <h3>Areas to Improve</h3>

                            <ul>
                                {result.weaknesses.map((weakness, index) => (
                                    <li key={index}>{weakness}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="evaluation-section">
                            <h3>AI Feedback</h3>

                            <p>{result.feedback}</p>
                        </div>

                        <button onClick={() => navigate("/dashboard")}>
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}