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
        return 'You are an AI job interview coach. Evaluate candidate answers professionally. Consider relevance, technical accuracy, clarity, communication, and completeness. Give constructive feedback that helps the candidate improve.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'score' => $schema->integer()->min(1)->max(10)->required(),
            'strengths' => $schema->array()
                ->items($schema->string())
                ->required(),
            'weaknesses' => $schema->array()
                ->items($schema->string())
                ->required(),
            'feedback' => $schema->string()->required(),
        ];
    }

    public function model(): string
    {
        return 'gemini-flash-lite-latest';
    }
}