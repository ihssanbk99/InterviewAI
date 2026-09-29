import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewSetup() {
    const navigate = useNavigate();

    const [interviewType, setInterviewType] = useState("");
    const [level, setLevel] = useState("");

    const handleStart = (e) => {
        e.preventDefault();

        if (!interviewType || !level) {
            return;
        }

        navigate("/interview", {
            state: {
                interviewType,
                level,
            },
        });
    };

    return (
        <div className="interview-setup-page">
            <div className="interview-setup-card">
                <h1>Start Your Interview</h1>
                <p>Choose your interview type and experience level.</p>

                <form onSubmit={handleStart}>
                    <div className="form-group">
                        <label>Interview Type</label>

                        <select
                            value={interviewType}
                            onChange={(e) =>
                                setInterviewType(e.target.value)
                            }
                            required
                        >
                            <option value="">Select interview type</option>
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
                            onChange={(e) => setLevel(e.target.value)}
                            required
                        >
                            <option value="">Select your level</option>
                            <option value="Junior">Junior</option>
                            <option value="Mid-Level">Mid-Level</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </div>

                    <button type="submit">
                        Start Interview
                    </button>
                </form>
            </div>
        </div>
    );
}