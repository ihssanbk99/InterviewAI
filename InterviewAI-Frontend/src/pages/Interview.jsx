import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Interview.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function Interview() {
    const location = useLocation();
    const navigate = useNavigate();

    const { sessionId, interviewType, level } = location.state || {};

    const [question, setQuestion] = useState("");
    const [questionNumber, setQuestionNumber] = useState(1);
    const [answer, setAnswer] = useState("");
    const [loadingQuestion, setLoadingQuestion] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [violated, setViolated] = useState(false);

    const audioContextRef = useRef(null);
    const alarmIntervalRef = useRef(null);

    const playAlarmSound = () => {
        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        if (alarmIntervalRef.current) {
            return;
        }

        const audioContext =
            audioContextRef.current ||
            new AudioContext();

        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const masterGain =
            audioContext.createGain();

        masterGain.gain.setValueAtTime(
            1.8,
            audioContext.currentTime
        );

        masterGain.connect(
            audioContext.destination
        );

        const playTone = (
            frequency,
            duration
        ) => {
            const oscillator =
                audioContext.createOscillator();

            const gainNode =
                audioContext.createGain();

            oscillator.type = "square";

            oscillator.frequency.setValueAtTime(
                frequency,
                audioContext.currentTime
            );

            gainNode.gain.setValueAtTime(
                1,
                audioContext.currentTime
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + duration
            );

            oscillator.connect(gainNode);
            gainNode.connect(masterGain);

            oscillator.start();

            oscillator.stop(
                audioContext.currentTime +
                    duration
            );
        };

        let highTone = true;

        playTone(1150, 0.32);

        alarmIntervalRef.current =
            setInterval(() => {
                playTone(
                    highTone ? 1150 : 700,
                    0.32
                );

                highTone = !highTone;
            }, 380);

        setTimeout(() => {
            if (alarmIntervalRef.current) {
                clearInterval(
                    alarmIntervalRef.current
                );

                alarmIntervalRef.current = null;
            }

            masterGain.disconnect();
        }, 6000);
    };

    useEffect(() => {
        return () => {
            if (alarmIntervalRef.current) {
                clearInterval(
                    alarmIntervalRef.current
                );

                alarmIntervalRef.current = null;
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!sessionId) {
            return;
        }

        const generateQuestion = async () => {
            try {
                const token =
                    localStorage.getItem(
                        "interviewai_token"
                    );

                const response = await axios.post(
                    `${API_URL}/interview/generate-question`,
                    {
                        session_id: sessionId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setQuestion(
                    response.data.data.question
                );

                setQuestionNumber(
                    response.data.data.question_number
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to generate the interview question."
                );
            } finally {
                setLoadingQuestion(false);
            }
        };

        generateQuestion();
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId || violated) {
            return;
        }

        const handleVisibilityChange = async () => {
            if (
                document.visibilityState !==
                "hidden"
            ) {
                return;
            }

            playAlarmSound();

            try {
                const token =
                    localStorage.getItem(
                        "interviewai_token"
                    );

                await axios.post(
                    `${API_URL}/interview/violation`,
                    {
                        session_id: sessionId,
                        reason:
                            "Interview tab was left during the active interview.",
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } catch (err) {
                console.error(err);
            } finally {
                setViolated(true);
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [sessionId, violated]);

    if (
        !sessionId ||
        !interviewType ||
        !level
    ) {
        return (
            <div className="interview-page">
                <div className="interview-background">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="interview-not-found">
                    <div className="interview-not-found-icon">
                        AI
                    </div>

                    <div className="interview-status">
                        <span></span>
                        SESSION NOT FOUND
                    </div>

                    <h1>
                        Interview Not Found
                    </h1>

                    <p>
                        Your interview session could
                        not be found. Start a new
                        interview to continue.
                    </p>

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
                </div>
            </div>
        );
    }

    if (violated) {
        return (
            <div className="interview-page">
                <div className="interview-background">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="interview-warning-screen">
                    <div className="warning-icon">
                        !
                    </div>

                    <div className="warning-label">
                        INTERVIEW WARNING
                    </div>

                    <h1>
                        Interview Terminated
                    </h1>

                    <p>
                        Leaving the interview screen
                        is not allowed. An integrity
                        violation has been detected.
                    </p>

                    <div className="warning-result">
                        <span>
                            FINAL SCORE
                        </span>

                        <strong>0</strong>

                        <small>/10</small>
                    </div>

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !answer.trim() ||
            !question
        ) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token =
                localStorage.getItem(
                    "interviewai_token"
                );

            const response = await axios.post(
                `${API_URL}/interview/submit-answer`,
                {
                    session_id: sessionId,
                    question,
                    answer,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data =
                response.data.data;

            if (data.is_completed) {
                navigate(
                    `/interview-report/${sessionId}`
                );
                return;
            }

            setQuestion(
                data.next_question
            );

            setQuestionNumber(
                data.question_number
            );

            setAnswer("");
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
            <div className="interview-background">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <div className="interview-content">
                <header className="interview-header">
                    <div className="interview-header-info">
                        <div className="interview-status">
                            <span></span>
                            AI INTERVIEW SESSION
                        </div>

                        <h1>
                            {interviewType} Interview
                        </h1>

                        <div className="interview-meta">
                            <span>
                                {level}
                            </span>

                            <i></i>

                            <span>
                                AI Powered
                            </span>

                            <i></i>

                            <span>
                                Session #
                                {sessionId}
                            </span>
                        </div>
                    </div>

                    <button
                        className="exit-interview"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Exit Interview
                    </button>
                </header>

                <div className="interview-progress">
                    <div className="progress-info">
                        <span>
                            INTERVIEW PROGRESS
                        </span>

                        <strong>
                            Question{" "}
                            {String(
                                questionNumber
                            ).padStart(
                                2,
                                "0"
                            )}
                        </strong>
                    </div>

                    <div className="progress-line">
                        <span
                            style={{
                                width: `${
                                    (questionNumber /
                                        5) *
                                    100
                                }%`,
                            }}
                        ></span>
                    </div>

                    <div className="progress-count">
                        {String(
                            questionNumber
                        ).padStart(
                            2,
                            "0"
                        )}{" "}
                        / 05
                    </div>
                </div>

                <main className="interview-main">
                    <section className="question-card">
                        <div className="question-label">
                            <div className="question-number">
                                {String(
                                    questionNumber
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </div>

                            <div>
                                <span>
                                    AI GENERATED
                                    QUESTION
                                </span>

                                <p>
                                    Take your time
                                    and answer
                                    naturally.
                                </p>
                            </div>
                        </div>

                        {loadingQuestion ? (
                            <div className="question-loading">
                                <div className="button-loader"></div>

                                <span>
                                    AI is preparing
                                    your question...
                                </span>
                            </div>
                        ) : (
                            <>
                                <h2>
                                    {question}
                                </h2>

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >
                                    <div className="answer-header">
                                        <label>
                                            Your
                                            Answer
                                        </label>

                                        <span>
                                            {
                                                answer.length
                                            }{" "}
                                            characters
                                        </span>
                                    </div>

                                    <textarea
                                        value={
                                            answer
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setAnswer(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Type your answer here..."
                                        rows="9"
                                        disabled={
                                            loading
                                        }
                                    />

                                    {error && (
                                        <div className="interview-error">
                                            <span>
                                                !
                                            </span>

                                            {
                                                error
                                            }
                                        </div>
                                    )}

                                    <div className="answer-footer">
                                        <p>
                                            Be specific
                                            and explain
                                            your
                                            experience
                                            clearly.
                                        </p>

                                        <button
                                            type="submit"
                                            disabled={
                                                !answer.trim() ||
                                                loading
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="button-loader"></span>
                                                    AI is
                                                    evaluating...
                                                </>
                                            ) : (
                                                <>
                                                    Submit
                                                    Answer
                                                    <span>
                                                        →
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {error &&
                            !loadingQuestion && (
                                <div className="interview-error">
                                    <span>
                                        !
                                    </span>

                                    {error}
                                </div>
                            )}
                    </section>
                </main>
            </div>
        </div>
    );
}