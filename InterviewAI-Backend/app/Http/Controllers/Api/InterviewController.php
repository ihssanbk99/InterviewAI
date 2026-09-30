<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\InterviewCoach;
use App\Ai\Agents\InterviewQuestionGenerator;
use App\Ai\Agents\OverallInterviewFeedback;
use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\InterviewSession;
use Illuminate\Http\Request;
use Laravel\Ai\Transcription;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $interviews = Interview::with('session')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $sessions = InterviewSession::with('interviews')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'interviews' => $interviews,
            'sessions' => $sessions,
        ]);
    }

    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'interview_type' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:255'],
        ]);

        $session = InterviewSession::create([
            'user_id' => $request->user()->id,
            'interview_type' => $validated['interview_type'],
            'level' => $validated['level'],
            'status' => 'in_progress',
            'integrity_status' => 'valid',
            'current_question' => 1,
            'total_questions' => 5,
        ]);

        return response()->json([
            'message' => 'Interview session started successfully',
            'session' => $session,
        ], 201);
    }

    public function generateQuestion(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'integer', 'exists:interview_sessions,id'],
        ]);

        $session = InterviewSession::where('id', $validated['session_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (
            $session->status === 'completed' ||
            $session->status === 'terminated'
        ) {
            return response()->json([
                'message' => 'Interview session has already ended.',
            ], 409);
        }

        $agent = new InterviewQuestionGenerator();

        $prompt = "
Generate interview question number {$session->current_question} for a {$session->level} candidate applying for a {$session->interview_type} position.

The question should be appropriate for the candidate's experience level and relevant to the selected role.

Do not include an answer, explanation, score, or feedback.
Return only the interview question through the structured response.
";

        try {
            $result = retry(
                3,
                fn () => $agent->prompt($prompt),
                1500
            );
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'The AI service is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }

        return response()->json([
            'message' => 'Interview question generated successfully',
            'data' => [
                'session_id' => $session->id,
                'question_number' => $session->current_question,
                'question' => $result['question'],
            ],
        ]);
    }

    public function transcribeAnswer(Request $request)
    {
        $validated = $request->validate([
            'audio' => [
                'required',
                'file',
                'mimes:webm,mp3,wav,ogg,m4a,mp4,mpeg,mpga,flac',
                'max:25600',
            ],
            'session_id' => [
                'required',
                'integer',
                'exists:interview_sessions,id',
            ],
        ]);

        $session = InterviewSession::where('id', $validated['session_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (
            $session->status === 'completed' ||
            $session->status === 'terminated' ||
            $session->integrity_status === 'violated'
        ) {
            return response()->json([
                'message' => 'Interview session has already ended.',
            ], 409);
        }

        try {
            $transcript = Transcription::fromUpload(
                $validated['audio']
            )->generate();

            $transcription = trim((string) $transcript);

            if ($transcription === '') {
                return response()->json([
                    'message' => 'No speech could be detected in the recording.',
                ], 422);
            }

            return response()->json([
                'message' => 'Recording transcribed successfully.',
                'data' => [
                    'session_id' => $session->id,
                    'transcription' => $transcription,
                ],
            ]);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'The transcription service is temporarily unavailable. Please try again.',
            ], 503);
        }
    }

    public function submitAnswer(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'integer', 'exists:interview_sessions,id'],
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
        ]);

        $session = InterviewSession::where('id', $validated['session_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (
            $session->status === 'completed' ||
            $session->status === 'terminated' ||
            $session->integrity_status === 'violated'
        ) {
            return response()->json([
                'message' => 'Interview session has already ended.',
            ], 409);
        }

        $agent = new InterviewCoach();

        $prompt = "
You are evaluating a candidate during a {$session->interview_type} job interview.

Experience level: {$session->level}

Interview question:
{$validated['question']}

Candidate answer:
{$validated['answer']}

Evaluate the candidate independently using these five criteria.

1. Technical Accuracy
Score from 0 to 10 based on correctness of the technical information, concepts, methods, and examples in the answer.

2. Relevance
Score from 0 to 10 based on how directly the answer addresses the interview question and selected role.

3. Completeness
Score from 0 to 10 based on how thoroughly the candidate answers the question and covers important points expected at the selected experience level.

4. Clarity and Communication
Score from 0 to 10 based on how clearly, logically, and professionally the candidate communicates the answer.

5. Experience-Level Fit
Score from 0 to 10 based on whether the quality and depth of the answer are appropriate for a {$session->level} candidate.

Do not calculate an overall score.
Do not average the criteria.
Return each criterion score separately.

Also provide concise strengths, weaknesses, and constructive feedback.
";

        try {
            $result = retry(
                3,
                fn () => $agent->prompt($prompt),
                1500
            );
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'The AI service is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }

        $evaluation = [
            'technical_accuracy' => (int) $result['technical_accuracy'],
            'relevance' => (int) $result['relevance'],
            'completeness' => (int) $result['completeness'],
            'clarity_communication' => (int) $result['clarity_communication'],
            'experience_level_fit' => (int) $result['experience_level_fit'],
            'strengths' => $result['strengths'],
            'weaknesses' => $result['weaknesses'],
            'feedback' => $result['feedback'],
        ];

        $technicalAccuracy = $evaluation['technical_accuracy'];
        $relevance = $evaluation['relevance'];
        $completeness = $evaluation['completeness'];
        $clarityCommunication = $evaluation['clarity_communication'];
        $experienceLevelFit = $evaluation['experience_level_fit'];

        $weightedScore =
            ($technicalAccuracy * 0.30) +
            ($relevance * 0.25) +
            ($completeness * 0.20) +
            ($clarityCommunication * 0.15) +
            ($experienceLevelFit * 0.10);

        $score = round($weightedScore, 2);

        $interview = Interview::create([
            'user_id' => $request->user()->id,
            'session_id' => $session->id,
            'interview_type' => $session->interview_type,
            'level' => $session->level,
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'score' => round($score),
            'technical_accuracy' => $technicalAccuracy,
            'relevance' => $relevance,
            'completeness' => $completeness,
            'clarity_communication' => $clarityCommunication,
            'experience_level_fit' => $experienceLevelFit,
            'strengths' => $evaluation['strengths'],
            'weaknesses' => $evaluation['weaknesses'],
            'feedback' => $evaluation['feedback'],
        ]);

        if ($session->current_question >= $session->total_questions) {
            $interviews = Interview::where('session_id', $session->id)
                ->orderBy('id')
                ->get();

            $finalScore = round(
                $interviews->avg('score'),
                2
            );

            $allStrengths = $interviews
                ->pluck('strengths')
                ->flatten()
                ->filter()
                ->unique()
                ->values()
                ->take(6)
                ->toArray();

            $allWeaknesses = $interviews
                ->pluck('weaknesses')
                ->flatten()
                ->filter()
                ->unique()
                ->values()
                ->take(6)
                ->toArray();

            $overallAnalysis = [
                'performance_summary' => 'Your interview demonstrated a mix of strengths and areas for improvement across the evaluated questions. Review the detailed analysis below to understand your overall performance.',
                'technical_performance' => 'Your technical performance was evaluated across the complete interview. Review the individual technical criteria to identify recurring patterns.',
                'communication_performance' => 'Your communication was evaluated based on clarity, structure, relevance, and professionalism across your answers.',
                'experience_assessment' => "Your answers were evaluated against the expected level for a {$session->level} candidate.",
                'key_strengths' => $allStrengths,
                'main_weaknesses' => $allWeaknesses,
                'areas_to_improve' => $allWeaknesses,
                'action_plan' => [
                    'Review the areas identified in the interview feedback.',
                    'Practice answering technical questions with clear structure and specific examples.',
                    'Repeat mock interviews to improve consistency and confidence.',
                ],
            ];

            $overallAgent = new OverallInterviewFeedback();

            $interviewData = $interviews->map(function ($item, $index) {
                return [
                    'question_number' => $index + 1,
                    'question' => $item->question,
                    'answer' => $item->answer,
                    'score' => $item->score,
                    'technical_accuracy' => $item->technical_accuracy,
                    'relevance' => $item->relevance,
                    'completeness' => $item->completeness,
                    'clarity_communication' => $item->clarity_communication,
                    'experience_level_fit' => $item->experience_level_fit,
                    'strengths' => $item->strengths,
                    'weaknesses' => $item->weaknesses,
                    'feedback' => $item->feedback,
                ];
            })->values()->toArray();

            $overallPrompt = "
Analyze the candidate's complete {$session->interview_type} interview.

Candidate experience level: {$session->level}

The interview contains {$interviews->count()} questions.

Below is the complete interview data:

" . json_encode($interviewData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "

Provide a comprehensive overall analysis of the candidate.

Performance Summary:
Explain the candidate's overall performance across the complete interview. Identify recurring patterns instead of simply repeating individual feedback.

Technical Performance:
Analyze the candidate's technical knowledge, accuracy, depth, practical understanding, and ability to explain technical concepts across the interview.

Communication Performance:
Analyze clarity, structure, relevance, professionalism, and how effectively the candidate communicates ideas.

Experience Assessment:
Assess how the candidate's answers align with the expected {$session->level} experience level. Discuss whether the depth and quality of the answers generally match that level.

Key Strengths:
Identify the most important strengths demonstrated repeatedly across the interview.

Main Weaknesses:
Identify recurring weaknesses that affected multiple answers or the overall performance.

Areas to Improve:
Provide specific areas the candidate should work on to improve future interview performance.

Action Plan:
Provide practical and actionable steps the candidate can take before the next interview.

Do not calculate a new overall numerical score.
Do not invent information that is not present in the interview data.
Do not simply repeat every individual strength or weakness.
Focus on meaningful patterns across the complete interview.
";

            try {
                $overallResult = retry(
                    3,
                    fn () => $overallAgent->prompt($overallPrompt),
                    1500
                );

                $overallAnalysis = [
                    'performance_summary' => $overallResult['performance_summary'],
                    'technical_performance' => $overallResult['technical_performance'],
                    'communication_performance' => $overallResult['communication_performance'],
                    'experience_assessment' => $overallResult['experience_assessment'],
                    'key_strengths' => $overallResult['key_strengths'],
                    'main_weaknesses' => $overallResult['main_weaknesses'],
                    'areas_to_improve' => $overallResult['areas_to_improve'],
                    'action_plan' => $overallResult['action_plan'],
                ];
            } catch (\Throwable $exception) {
            }

            $session->update([
                'status' => 'completed',
                'final_score' => $finalScore,
                'overall_analysis' => $overallAnalysis,
            ]);

            return response()->json([
                'message' => 'Interview completed successfully',
                'data' => [
                    'id' => $interview->id,
                    'session_id' => $interview->session_id,
                    'question_number' => $session->current_question,
                    'is_completed' => true,
                    'final_score' => $finalScore,
                    'evaluation' => [
                        'score' => $interview->score,
                        'criteria' => [
                            'technical_accuracy' => $technicalAccuracy,
                            'relevance' => $relevance,
                            'completeness' => $completeness,
                            'clarity_communication' => $clarityCommunication,
                            'experience_level_fit' => $experienceLevelFit,
                        ],
                        'strengths' => $interview->strengths,
                        'weaknesses' => $interview->weaknesses,
                        'feedback' => $interview->feedback,
                    ],
                    'report' => [
                        'overall_strengths' => $overallAnalysis['key_strengths'],
                        'overall_weaknesses' => $overallAnalysis['main_weaknesses'],
                        'overall_feedback' => $overallAnalysis['performance_summary'],
                        'overall_analysis' => $overallAnalysis,
                    ],
                ],
            ]);
        }

        $nextQuestionNumber = $session->current_question + 1;

        $session->update([
            'current_question' => $nextQuestionNumber,
        ]);

        $questionAgent = new InterviewQuestionGenerator();

        $questionPrompt = "
Generate interview question number {$nextQuestionNumber} for a {$session->level} candidate applying for a {$session->interview_type} position.

This is the next question in the same interview session.

Create a realistic question that is relevant to the selected role and experience level.
Do not repeat the previous question.
Do not include an answer, explanation, score, or feedback.
Return only the interview question through the structured response.
";

        try {
            $questionResult = retry(
                3,
                fn () => $questionAgent->prompt($questionPrompt),
                1500
            );
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => 'The AI service is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }

        return response()->json([
            'message' => 'Answer evaluated and next question generated successfully',
            'data' => [
                'id' => $interview->id,
                'session_id' => $interview->session_id,
                'question_number' => $session->current_question,
                'is_completed' => false,
                'evaluation' => [
                    'score' => $interview->score,
                    'criteria' => [
                        'technical_accuracy' => $technicalAccuracy,
                        'relevance' => $relevance,
                        'completeness' => $completeness,
                        'clarity_communication' => $clarityCommunication,
                        'experience_level_fit' => $experienceLevelFit,
                    ],
                    'strengths' => $interview->strengths,
                    'weaknesses' => $interview->weaknesses,
                    'feedback' => $interview->feedback,
                ],
                'next_question' => $questionResult['question'],
            ],
        ]);
    }

    public function showReport(Request $request, $sessionId)
    {
        $session = InterviewSession::where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($session->status !== 'completed') {
            return response()->json([
                'message' => 'The interview has not been completed yet.',
            ], 409);
        }

        $interviews = Interview::where('session_id', $session->id)
            ->orderBy('id')
            ->get();

        $allStrengths = $interviews
            ->pluck('strengths')
            ->flatten()
            ->filter()
            ->unique()
            ->values()
            ->take(6)
            ->toArray();

        $allWeaknesses = $interviews
            ->pluck('weaknesses')
            ->flatten()
            ->filter()
            ->unique()
            ->values()
            ->take(6)
            ->toArray();

        $overallAnalysis = $session->overall_analysis;

        if (!is_array($overallAnalysis)) {
            $overallAnalysis = [
                'performance_summary' => 'Your overall interview performance was based on the quality of your answers across all questions. Review the individual feedback to identify patterns in your strengths and areas for improvement.',
                'technical_performance' => 'Review the technical criteria from each answer to identify recurring technical strengths and gaps.',
                'communication_performance' => 'Review the clarity and communication criteria from each answer to identify recurring communication patterns.',
                'experience_assessment' => "Your answers were evaluated against the expected level for a {$session->level} candidate.",
                'key_strengths' => $allStrengths,
                'main_weaknesses' => $allWeaknesses,
                'areas_to_improve' => $allWeaknesses,
                'action_plan' => [
                    'Review the detailed feedback from each interview question.',
                    'Practice explaining technical concepts with clear structure and examples.',
                    'Repeat mock interviews to improve consistency.',
                ],
            ];
        }

        $criteriaAverages = [
            'technical_accuracy' => round(
                (float) $interviews->avg('technical_accuracy'),
                2
            ),
            'relevance' => round(
                (float) $interviews->avg('relevance'),
                2
            ),
            'completeness' => round(
                (float) $interviews->avg('completeness'),
                2
            ),
            'clarity_communication' => round(
                (float) $interviews->avg('clarity_communication'),
                2
            ),
            'experience_level_fit' => round(
                (float) $interviews->avg('experience_level_fit'),
                2
            ),
        ];

        $questionScores = $interviews->values()->map(
            function ($interview, $index) {
                return [
                    'question' => 'Q' . ($index + 1),
                    'score' => (float) $interview->score,
                ];
            }
        )->toArray();

        return response()->json([
            'message' => 'Interview report loaded successfully',
            'data' => [
                'session_id' => $session->id,
                'interview_type' => $session->interview_type,
                'level' => $session->level,
                'status' => $session->status,
                'integrity_status' => $session->integrity_status,
                'total_questions' => $session->total_questions,
                'final_score' => (float) $session->final_score,
                'overall_strengths' => $overallAnalysis['key_strengths'] ?? $allStrengths,
                'overall_weaknesses' => $overallAnalysis['main_weaknesses'] ?? $allWeaknesses,
                'overall_feedback' => $overallAnalysis['performance_summary'] ?? '',
                'overall_analysis' => $overallAnalysis,
                'chart_data' => [
                    'criteria_averages' => $criteriaAverages,
                    'question_scores' => $questionScores,
                ],
                'interviews' => $interviews,
            ],
        ]);
    }

    public function recordViolation(Request $request)
    {
        $validated = $request->validate([
            'session_id' => ['required', 'integer', 'exists:interview_sessions,id'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $session = InterviewSession::where('id', $validated['session_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (
            $session->status === 'completed' ||
            $session->status === 'terminated' ||
            $session->integrity_status === 'violated'
        ) {
            return response()->json([
                'message' => 'Interview session has already ended.',
            ], 409);
        }

        $session->update([
            'status' => 'terminated',
            'integrity_status' => 'violated',
            'violation_reason' => $validated['reason'],
            'final_score' => 0,
        ]);

        return response()->json([
            'message' => 'Interview terminated due to integrity violation.',
            'data' => [
                'session_id' => $session->id,
                'status' => $session->status,
                'integrity_status' => $session->integrity_status,
                'violation_reason' => $session->violation_reason,
                'final_score' => 0,
            ],
        ]);
    }
}