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
    const [transcribing, setTranscribing] = useState(false);
    const [error, setError] = useState("");
    const [violated, setViolated] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState("");
    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
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

    const stopRecordingStream = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());

            mediaStreamRef.current = null;
        }
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError(
                "Microphone recording is not supported by this browser."
            );
            return;
        }

        try {
            setError("");
            setAudioBlob(null);

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl("");
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            mediaStreamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder =
                new MediaRecorder(stream);

            mediaRecorderRef.current =
                mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(
                        event.data
                    );
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob =
                    new Blob(
                        audioChunksRef.current,
                        {
                            type:
                                mediaRecorder.mimeType ||
                                "audio/webm",
                        }
                    );

                const url =
                    URL.createObjectURL(
                        audioBlob
                    );

                setAudioBlob(audioBlob);
                setAudioUrl(url);
                stopRecordingStream();
            };

            mediaRecorder.start();

            setIsRecording(true);
            setRecordingTime(0);

            recordingTimerRef.current =
                setInterval(() => {
                    setRecordingTime(
                        (time) => time + 1
                    );
                }, 1000);
        } catch (err) {
            if (
                err.name ===
                "NotAllowedError"
            ) {
                setError(
                    "Microphone permission was denied. Please allow microphone access and try again."
                );
            } else {
                setError(
                    "Unable to access your microphone."
                );
            }
        }
    };

    const stopRecording = () => {
        if (
            !mediaRecorderRef.current ||
            mediaRecorderRef.current.state ===
                "inactive"
        ) {
            return;
        }

        mediaRecorderRef.current.stop();

        setIsRecording(false);

        if (recordingTimerRef.current) {
            clearInterval(
                recordingTimerRef.current
            );

            recordingTimerRef.current = null;
        }
    };

    const transcribeRecording = async () => {
        if (!audioBlob || !sessionId) {
            return;
        }

        try {
            setTranscribing(true);
            setError("");

            const token =
                localStorage.getItem(
                    "interviewai_token"
                );

            const formData = new FormData();

            const extension =
                audioBlob.type.includes("webm")
                    ? "webm"
                    : "audio";

            formData.append(
                "audio",
                audioBlob,
                `interview-answer.${extension}`
            );

            formData.append(
                "session_id",
                sessionId
            );

            const response = await axios.post(
                `${API_URL}/interview/transcribe`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const transcription =
                response.data.data.transcription;

            setAnswer(transcription);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to transcribe your recording."
            );
        } finally {
            setTranscribing(false);
        }
    };

    const clearRecording = () => {
        if (isRecording) {
            stopRecording();
        }

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl("");
        setAudioBlob(null);
        setRecordingTime(0);
        audioChunksRef.current = [];
    };

    const formatRecordingTime = (seconds) => {
        const minutes = Math.floor(
            seconds / 60
        );

        const remainingSeconds =
            seconds % 60;

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    useEffect(() => {
        return () => {
            if (alarmIntervalRef.current) {
                clearInterval(
                    alarmIntervalRef.current
                );

                alarmIntervalRef.current = null;
            }

            if (recordingTimerRef.current) {
                clearInterval(
                    recordingTimerRef.current
                );

                recordingTimerRef.current = null;
            }

            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !==
                    "inactive"
            ) {
                mediaRecorderRef.current.stop();
            }

            stopRecordingStream();

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

            if (isRecording) {
                stopRecording();
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
    }, [sessionId, violated, isRecording]);

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
            clearRecording();
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
                                            loading ||
                                            isRecording ||
                                            transcribing
                                        }
                                    />

                                    <div className="voice-recorder">
                                        <div className="voice-recorder-info">
                                            <div
                                                className={`microphone-icon ${
                                                    isRecording
                                                        ? "recording"
                                                        : ""
                                                }`}
                                            >
                                                <span>●</span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {isRecording
                                                        ? "Recording your answer"
                                                        : transcribing
                                                            ? "Transcribing your answer"
                                                            : "Voice Answer"}
                                                </strong>

                                                <p>
                                                    {isRecording
                                                        ? "Speak naturally and clearly."
                                                        : transcribing
                                                            ? "AI is converting your voice into text."
                                                            : "Record your answer using your microphone."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="voice-recorder-actions">
                                            {isRecording && (
                                                <div className="recording-time">
                                                    {formatRecordingTime(
                                                        recordingTime
                                                    )}
                                                </div>
                                            )}

                                            {!isRecording ? (
                                                <button
                                                    type="button"
                                                    className="record-button"
                                                    onClick={
                                                        startRecording
                                                    }
                                                    disabled={
                                                        loading ||
                                                        transcribing
                                                    }
                                                >
                                                    <span>
                                                        ●
                                                    </span>
                                                    Start Recording
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="stop-recording-button"
                                                    onClick={
                                                        stopRecording
                                                    }
                                                >
                                                    <span></span>
                                                    Stop Recording
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {audioUrl && (
                                        <div className="recording-preview">
                                            <div className="recording-preview-header">
                                                <span>
                                                    RECORDING READY
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        clearRecording
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <audio
                                                controls
                                                src={
                                                    audioUrl
                                                }
                                            ></audio>

                                            <button
                                                type="button"
                                                className="transcribe-button"
                                                onClick={
                                                    transcribeRecording
                                                }
                                                disabled={
                                                    transcribing ||
                                                    loading
                                                }
                                            >
                                                {transcribing ? (
                                                    <>
                                                        <span className="button-loader"></span>
                                                        Transcribing...
                                                    </>
                                                ) : (
                                                    <>
                                                        Transcribe Recording
                                                        <span>→</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

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
                                                loading ||
                                                isRecording ||
                                                transcribing
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