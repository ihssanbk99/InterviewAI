import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const API_URL = "http://127.0.0.1:8000/api";

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
            <div className="interview-setup-card">
                <h1>Start Your Interview</h1>

                <p>
                    Choose your interview type and experience level.
                </p>

                {error && (
                    <div className="interview-setup-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleStart}>
                    <div className="form-group">
                        <label>Interview Type</label>

                        <select
                            value={interviewType}
                            onChange={(e) =>
                                setInterviewType(e.target.value)
                            }
                            disabled={loading}
                            required
                        >
                            <option value="">
                                Select interview type
                            </option>

                            <option value="Full Stack Developer">
                                Full Stack Developer
                            </option>

                            <option value="Frontend Developer">
                                Frontend Developer
                            </option>

                            <option value="Backend Developer">
                                Backend Developer
                            </option>

                            <option value="Data Analyst">
                                Data Analyst
                            </option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Experience Level</label>

                        <select
                            value={level}
                            onChange={(e) =>
                                setLevel(e.target.value)
                            }
                            disabled={loading}
                            required
                        >
                            <option value="">
                                Select your level
                            </option>

                            <option value="Junior">
                                Junior
                            </option>

                            <option value="Mid-Level">
                                Mid-Level
                            </option>

                            <option value="Senior">
                                Senior
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !interviewType ||
                            !level
                        }
                    >
                        {loading
                            ? "Starting Interview..."
                            : "Start Interview"}
                    </button>
                </form>
            </div>
        </div>
    );
}