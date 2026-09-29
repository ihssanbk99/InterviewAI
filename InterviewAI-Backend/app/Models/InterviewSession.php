<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterviewSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'interview_type',
        'level',
        'status',
        'integrity_status',
        'violation_reason',
        'final_score',
        'current_question',
        'total_questions',
    ];

    protected function casts(): array
    {
        return [
            'current_question' => 'integer',
            'total_questions' => 'integer',
            'final_score' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class, 'session_id');
    }
}