<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class InterviewQuestionGenerator implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an AI job interview question generator. Create realistic, professional interview questions that match the candidate role, experience level, and question number. Questions should be clear, relevant, and suitable for an actual job interview.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'question' => $schema->string()->required(),
        ];
    }

    public function model(): string
    {
        return 'gemini-flash-lite-latest';
    }
}