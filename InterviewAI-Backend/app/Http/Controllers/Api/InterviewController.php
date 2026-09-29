<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\InterviewCoach;
use App\Http\Controllers\Controller;
use App\Models\Interview;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        $interviews = Interview::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'interviews' => $interviews,
        ]);
    }

    public function submitAnswer(Request $request)
    {
        $validated = $request->validate([
            'interview_type' => ['required', 'string', 'max:255'],
            'level' => ['required', 'string', 'max:255'],
            'question' => ['required', 'string'],
            'answer' => ['required', 'string'],
        ]);

        $agent = new InterviewCoach();

        $prompt = "
You are evaluating a candidate during a {$validated['interview_type']} job interview.

Experience level: {$validated['level']}

Interview question:
{$validated['question']}

Candidate answer:
{$validated['answer']}

Evaluate the candidate's answer based on relevance, technical accuracy, clarity, communication, completeness, and suitability for the selected experience level.
";

        $result = $agent->prompt($prompt);

        $evaluation = $result->structured;

        $interview = Interview::create([
            'user_id' => $request->user()->id,
            'interview_type' => $validated['interview_type'],
            'level' => $validated['level'],
            'question' => $validated['question'],
            'answer' => $validated['answer'],
            'score' => $evaluation['score'],
            'strengths' => $evaluation['strengths'],
            'weaknesses' => $evaluation['weaknesses'],
            'feedback' => $evaluation['feedback'],
        ]);

        return response()->json([
            'message' => 'Answer evaluated and saved successfully',
            'data' => [
                'id' => $interview->id,
                'interview_type' => $interview->interview_type,
                'level' => $interview->level,
                'question' => $interview->question,
                'answer' => $interview->answer,
                'evaluation' => [
                    'score' => $interview->score,
                    'strengths' => $interview->strengths,
                    'weaknesses' => $interview->weaknesses,
                    'feedback' => $interview->feedback,
                ],
            ],
        ]);
    }
}