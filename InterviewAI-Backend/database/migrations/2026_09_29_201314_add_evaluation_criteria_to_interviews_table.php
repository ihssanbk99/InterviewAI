<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->unsignedTinyInteger('technical_accuracy')->nullable()->after('score');
            $table->unsignedTinyInteger('relevance')->nullable()->after('technical_accuracy');
            $table->unsignedTinyInteger('completeness')->nullable()->after('relevance');
            $table->unsignedTinyInteger('clarity_communication')->nullable()->after('completeness');
            $table->unsignedTinyInteger('experience_level_fit')->nullable()->after('clarity_communication');
        });
    }

    public function down(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->dropColumn([
                'technical_accuracy',
                'relevance',
                'completeness',
                'clarity_communication',
                'experience_level_fit',
            ]);
        });
    }
};