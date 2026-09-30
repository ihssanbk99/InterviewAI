<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\InterviewCoach;
use App\Ai\Agents\InterviewQuestionGenerator;
use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\InterviewSession;
use Illuminate\Http\Request;

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
                'question' => $result->structured['question'],
            ],
        ]);
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

        $evaluation = $result->structured;

        $technicalAccuracy = (int) $evaluation['technical_accuracy'];
        $relevance = (int) $evaluation['relevance'];
        $completeness = (int) $evaluation['completeness'];
        $clarityCommunication = (int) $evaluation['clarity_communication'];
        $experienceLevelFit = (int) $evaluation['experience_level_fit'];

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

            $feedbackParts = $interviews
                ->pluck('feedback')
                ->filter()
                ->values()
                ->toArray();

            $overallFeedback =
                'Your overall interview performance was based on the quality of your answers across all questions. ' .
                'Review the individual feedback below to identify patterns in your strengths and areas for improvement.';

            if (!empty($feedbackParts)) {
                $overallFeedback .= ' Key feedback from the interview: ' .
                    implode(' ', array_slice($feedbackParts, 0, 3));
            }

            $session->update([
                'status' => 'completed',
                'final_score' => $finalScore,
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
                        'overall_strengths' => $allStrengths,
                        'overall_weaknesses' => $allWeaknesses,
                        'overall_feedback' => $overallFeedback,
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
                'next_question' => $questionResult->structured['question'],
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

        $feedbackParts = $interviews
            ->pluck('feedback')
            ->filter()
            ->values()
            ->toArray();

        $overallFeedback =
            'Your overall interview performance was based on the quality of your answers across all questions. ' .
            'Review the individual feedback to identify patterns in your strengths and areas for improvement.';

        if (!empty($feedbackParts)) {
            $overallFeedback .= ' Key feedback from the interview: ' .
                implode(' ', array_slice($feedbackParts, 0, 3));
        }

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
                'overall_strengths' => $allStrengths,
                'overall_weaknesses' => $allWeaknesses,
                'overall_feedback' => $overallFeedback,
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