<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class InterviewCoach implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an AI job interview evaluator. Evaluate candidate answers professionally and consistently. Score each evaluation criterion independently from 0 to 10. Do not calculate or provide an overall score. Focus only on the quality of the candidate answer based on the interview question, role, and experience level.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'technical_accuracy' => $schema->integer()
                ->min(0)
                ->max(10)
                ->required(),

            'relevance' => $schema->integer()
                ->min(0)
                ->max(10)
                ->required(),

            'completeness' => $schema->integer()
                ->min(0)
                ->max(10)
                ->required(),

            'clarity_communication' => $schema->integer()
                ->min(0)
                ->max(10)
                ->required(),

            'experience_level_fit' => $schema->integer()
                ->min(0)
                ->max(10)
                ->required(),

            'strengths' => $schema->array()
                ->items($schema->string())
                ->required(),

            'weaknesses' => $schema->array()
                ->items($schema->string())
                ->required(),

            'feedback' => $schema->string()
                ->required(),
        ];
    }

    public function model(): string
    {
        return 'gemini-flash-lite-latest';
    }
}