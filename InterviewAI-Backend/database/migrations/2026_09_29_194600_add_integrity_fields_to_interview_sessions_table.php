<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->string('integrity_status')->default('valid')->after('status');
            $table->string('violation_reason')->nullable()->after('integrity_status');
            $table->decimal('final_score', 4, 2)->nullable()->after('violation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('interview_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'integrity_status',
                'violation_reason',
                'final_score',
            ]);
        });
    }
};