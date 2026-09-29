<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InterviewController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::post('/interview/start', [InterviewController::class, 'startSession']);
    Route::post('/interview/generate-question', [InterviewController::class, 'generateQuestion']);
    Route::post('/interview/submit-answer', [InterviewController::class, 'submitAnswer']);
    Route::post('/interview/violation', [InterviewController::class, 'recordViolation']);

    Route::get('/interview/report/{sessionId}', [InterviewController::class, 'showReport']);

    Route::get('/interviews', [InterviewController::class, 'index']);
});