<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipStatusController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('membership')->name('membership.')->group(function () {
        Route::controller(MemberController::class)->group(function () {
            Route::get('register', 'create')->name('register');
            Route::post('register', 'store')->name('register');
        });

        Route::prefix('checkin')->name('checkin.')->controller(CheckinController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('check-in', 'checkin')->name('checkin');
            Route::post('check-out', 'checkout')->name('checkout');
        });

        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics');
        Route::get('analytics/search', [AnalyticsController::class, 'search'])->name('analytics.search');

        Route::prefix('attendance')->name('attendance.')->controller(AttendanceController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('search', 'search')->name('search');
        });

        Route::prefix('status')->name('status.')->controller(MembershipStatusController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('freeze', 'freeze')->name('freeze');
            Route::post('unfreeze', 'unfreeze')->name('unfreeze');
            Route::post('cancel', 'cancel')->name('cancel');
            Route::post('modify', 'modify')->name('modify');
        });
    });
});

require __DIR__.'/settings.php';
