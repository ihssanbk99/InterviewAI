<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'interview_type',
        'level',
        'question',
        'answer',
        'score',
        'technical_accuracy',
        'relevance',
        'completeness',
        'clarity_communication',
        'experience_level_fit',
        'strengths',
        'weaknesses',
        'feedback',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'technical_accuracy' => 'integer',
            'relevance' => 'integer',
            'completeness' => 'integer',
            'clarity_communication' => 'integer',
            'experience_level_fit' => 'integer',
            'strengths' => 'array',
            'weaknesses' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(
            InterviewSession::class,
            'session_id'
        );
    }
}