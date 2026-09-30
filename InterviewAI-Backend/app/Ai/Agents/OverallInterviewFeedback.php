<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

class OverallInterviewFeedback implements Agent, HasStructuredOutput
{
    use Promptable;

    public function instructions(): string
    {
        return 'You are an expert AI interview coach. Analyze the complete interview as a whole, not as isolated answers. Identify recurring patterns across the candidate answers, evaluate technical depth and communication, assess alignment with the selected experience level, and provide practical recommendations. Do not calculate or invent an overall numerical score. Keep the analysis professional, specific, constructive, and based only on the provided interview data.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'performance_summary' => $schema->string()->required(),

            'technical_performance' => $schema->string()->required(),

            'communication_performance' => $schema->string()->required(),

            'experience_assessment' => $schema->string()->required(),

            'key_strengths' => $schema->array()
                ->items($schema->string())
                ->required(),

            'main_weaknesses' => $schema->array()
                ->items($schema->string())
                ->required(),

            'areas_to_improve' => $schema->array()
                ->items($schema->string())
                ->required(),

            'action_plan' => $schema->array()
                ->items($schema->string())
                ->required(),
        ];
    }

    public function model(): string
    {
        return 'gemini-flash-lite-latest';
    }
}