<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('interview_type');
            $table->string('level');
            $table->string('status')->default('in_progress');
            $table->unsignedTinyInteger('current_question')->default(1);
            $table->unsignedTinyInteger('total_questions')->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_sessions');
    }
};