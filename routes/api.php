<?php

use App\Http\Controllers\Api\PaymentHistoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('members/{member}/payments', [PaymentHistoryController::class, 'index']);
});
