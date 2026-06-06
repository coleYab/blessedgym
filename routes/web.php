<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Billing\DebtLedgerController;
use App\Http\Controllers\Billing\FreezeController;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Billing\PaymentController;
use App\Http\Controllers\Billing\PlanController;
use App\Http\Controllers\Billing\RevenueController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\Employee\AttendanceController as EmployeeAttendanceController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\PerformanceController;
use App\Http\Controllers\Employee\StaffController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipStatusController;
use App\Models\CheckinLog;
use App\Models\DebtLedger;
use App\Models\EmployeeAttendanceLog;
use App\Models\Member;
use App\Models\Payment;
use App\Models\StaffLeaveRequest;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $today = today();
        $startOfMonth = now()->startOfMonth();

        return Inertia::render('dashboard', [
            'stats' => [
                'activeMembers' => Member::where('status', 'Active')->count(),
                'checkedInToday' => CheckinLog::whereDate('check_in_timestamp', $today)->count(),
                'revenueThisMonth' => (float) Payment::whereYear('payment_timestamp', now()->year)
                    ->whereMonth('payment_timestamp', now()->month)
                    ->sum('amount_paid'),
                'outstandingBalance' => (float) DebtLedger::sum('outstanding_balance'),
                'staffClockedIn' => EmployeeAttendanceLog::whereNull('clock_out_timestamp')->count(),
                'pendingLeave' => StaffLeaveRequest::where('status', 'Pending')->count(),
                'expiringSoon' => Member::where('status', 'Active')
                    ->whereNotNull('end_date')
                    ->where('end_date', '>=', $today)
                    ->where('end_date', '<=', $today->copy()->addDays(7))
                    ->count(),
                'totalMembers' => Member::count(),
                'newThisMonth' => Member::whereYear('registered_at', now()->year)
                    ->whereMonth('registered_at', now()->month)
                    ->count(),
            ],
            'recentCheckins' => CheckinLog::with('member')
                ->latest('check_in_timestamp')
                ->take(5)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'member' => $log->member ? "{$log->member->first_name} {$log->member->last_name}" : 'Unknown',
                    'check_in' => $log->check_in_timestamp,
                    'check_out' => $log->check_out_timestamp,
                    'method' => $log->check_in_method,
                ]),
            'recentPayments' => Payment::with('member')
                ->latest('payment_timestamp')
                ->take(5)
                ->get()
                ->map(fn ($payment) => [
                    'id' => $payment->id,
                    'member' => $payment->member ? "{$payment->member->first_name} {$payment->member->last_name}" : 'Unknown',
                    'amount' => (float) $payment->amount_paid,
                    'method' => $payment->payment_method,
                    'timestamp' => $payment->payment_timestamp,
                ]),
        ]);
    })->name('dashboard');

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

    Route::prefix('billing')->name('billing.')->group(function () {
        Route::controller(PlanController::class)->group(function () {
            Route::get('plans', 'index')->name('plans');
            Route::post('plans', 'store')->name('plans.store');
            Route::put('plans/{plan}', 'update')->name('plans.update');
            Route::delete('plans/{plan}', 'destroy')->name('plans.destroy');
        });

        Route::controller(InvoiceController::class)->group(function () {
            Route::get('invoices', 'index')->name('invoices');
            Route::post('invoices', 'store')->name('invoices.store');
            Route::post('invoices/{invoice}/finalize', 'finalize')->name('invoices.finalize');
            Route::get('invoices/{invoice}/pdf', 'pdf')->name('invoices.pdf');
            Route::delete('invoices/{invoice}', 'destroy')->name('invoices.destroy');
        });

        Route::controller(PaymentController::class)->group(function () {
            Route::get('payments', 'index')->name('payments');
            Route::post('payments', 'store')->name('payments.store');
            Route::post('payments/{payment}/refund', 'refund')->name('payments.refund');
            Route::delete('payments/{payment}', 'destroy')->name('payments.destroy');
            Route::get('history', 'history')->name('history');
        });

        Route::controller(DebtLedgerController::class)->group(function () {
            Route::get('balances', 'index')->name('balances');
            Route::post('balances/recalculate', 'recalculate')->name('balances.recalculate');
            Route::post('balances/recalculate/{member}', 'recalculateMember')->name('balances.recalculate-member');
        });

        Route::controller(FreezeController::class)->group(function () {
            Route::get('freeze', 'index')->name('freeze');
            Route::post('freeze', 'store')->name('freeze.store');
            Route::post('freeze/{member}/unfreeze', 'unfreeze')->name('freeze.unfreeze');
        });

        Route::controller(RevenueController::class)->group(function () {
            Route::get('revenue', 'index')->name('revenue');
            Route::get('revenue/export/pdf', 'exportPdf')->name('revenue.export.pdf');
            Route::get('revenue/export/csv', 'exportCsv')->name('revenue.export.csv');
            Route::post('expenses', 'storeExpense')->name('expenses.store');
            Route::put('expenses/{expense}', 'updateExpense')->name('expenses.update');
            Route::delete('expenses/{expense}', 'destroyExpense')->name('expenses.destroy');
        });
    });

    Route::prefix('employee')->name('employee.')->group(function () {
        Route::controller(StaffController::class)->group(function () {
            Route::get('staff', 'index')->name('staff');
            Route::get('staff/search-users', 'searchUsers')->name('staff.search-users');
            Route::post('staff', 'store')->name('staff.store');
            Route::put('staff/{staffProfile}', 'update')->name('staff.update');
            Route::delete('staff/{staffProfile}', 'destroy')->name('staff.destroy');
        });

        Route::prefix('attendance')->name('attendance.')->controller(EmployeeAttendanceController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('clock-in', 'clockIn')->name('clock-in');
            Route::post('clock-out', 'clockOut')->name('clock-out');
        });

        Route::controller(PerformanceController::class)->group(function () {
            Route::get('performance', 'index')->name('performance');
            Route::get('performance/search', 'search')->name('performance.search');
        });

        Route::controller(LeaveController::class)->group(function () {
            Route::get('leave', 'index')->name('leave');
            Route::post('leave', 'store')->name('leave.store');
            Route::post('leave/{leaveRequest}/approve', 'approve')->name('leave.approve');
            Route::post('leave/{leaveRequest}/deny', 'deny')->name('leave.deny');
            Route::delete('leave/{leaveRequest}', 'destroy')->name('leave.destroy');
        });
    });
});

require __DIR__.'/settings.php';
