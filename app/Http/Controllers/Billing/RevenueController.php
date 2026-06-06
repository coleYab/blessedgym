<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'monthly');
        $year = (int) ($request->input('year', now()->year));
        $month = (int) ($request->input('month', now()->month));

        $dashboardData = $this->getDashboardData($period, $year, $month);

        $expenses = Expense::orderByDesc('expense_date')->paginate(20);

        $revenueByPlan = $this->getRevenueByPlan($year, $month);

        $monthlyPnl = $this->getMonthlyPnl($year);

        return Inertia::render('billing/revenue', array_merge($dashboardData, [
            'expenses' => $expenses,
            'revenue_by_plan' => $revenueByPlan,
            'monthly_pnl' => $monthlyPnl,
            'period' => $period,
            'year' => $year,
            'month' => $month,
        ]));
    }

    public function exportPdf(Request $request)
    {
        $period = $request->input('period', 'monthly');
        $year = (int) ($request->input('year', now()->year));
        $month = (int) ($request->input('month', now()->month));

        $data = $this->getDashboardData($period, $year, $month);
        $data['revenue_by_plan'] = $this->getRevenueByPlan($year, $month);
        $data['monthly_pnl'] = $this->getMonthlyPnl($year);
        $data['period'] = $period;
        $data['year'] = $year;
        $data['month'] = $month;
        $data['generated_at'] = now()->format('Y-m-d H:i:s');

        $pdf = app('dompdf.wrapper')->loadView('pdfs.financial-report', $data);

        return $pdf->download("financial-report-{$year}-{$month}.pdf");
    }

    public function exportCsv(Request $request)
    {
        $period = $request->input('period', 'monthly');
        $year = (int) ($request->input('year', now()->year));
        $month = (int) ($request->input('month', now()->month));

        $data = $this->getDashboardData($period, $year, $month);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=financial-report-{$year}-{$month}.csv",
        ];

        $callback = function () use ($data, $period, $year, $month) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Financial Report', "{$year}-{$month}", ucfirst($period)]);
            fputcsv($handle, []);

            fputcsv($handle, ['Metric', 'Value']);
            fputcsv($handle, ['Total Revenue', number_format($data['total_revenue'], 2)]);
            fputcsv($handle, ['Total Expenses', number_format($data['total_expenses'], 2)]);
            fputcsv($handle, ['Net Profit', number_format($data['net_profit'], 2)]);
            fputcsv($handle, ['Outstanding Revenue', number_format($data['outstanding_revenue'], 2)]);
            fputcsv($handle, ['Total Refunds', number_format($data['total_refunds'], 2)]);

            fputcsv($handle, []);
            fputcsv($handle, ['Revenue by Plan']);
            fputcsv($handle, ['Plan', 'Revenue']);
            foreach ($data['revenue_by_plan'] ?? [] as $plan) {
                fputcsv($handle, [$plan['name'], number_format($plan['revenue'], 2)]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Monthly P&L']);
            fputcsv($handle, ['Month', 'Revenue', 'Expenses', 'Profit']);
            foreach ($data['monthly_pnl'] ?? [] as $row) {
                fputcsv($handle, [$row['month'], number_format($row['revenue'], 2), number_format($row['expenses'], 2), number_format($row['profit'], 2)]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:Utilities,Equipment,Salaries,Rent,Marketing,Supplies,Other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Expense::create($validated);

        return back();
    }

    public function updateExpense(Request $request, Expense $expense): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:Utilities,Equipment,Salaries,Rent,Marketing,Supplies,Other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $expense->update($validated);

        return back();
    }

    public function destroyExpense(Expense $expense): RedirectResponse
    {
        $expense->delete();

        return back();
    }

    private function getDashboardData(string $period, int $year, int $month): array
    {
        [$dateFrom, $dateTo] = $this->getDateRange($period, $year, $month);

        // Revenue from payments (non-refunded portion)
        $revenueQuery = Payment::where('payment_timestamp', '>=', $dateFrom)
            ->where('payment_timestamp', '<=', $dateTo);

        $totalRevenue = (clone $revenueQuery)->sum(DB::raw('amount_paid - COALESCE(refund_amount, 0)'));
        $totalRefunds = (clone $revenueQuery)->sum('refund_amount');

        // Raw revenue before refunds
        $grossRevenue = (clone $revenueQuery)->sum('amount_paid');

        // Total expenses
        $totalExpenses = Expense::where('expense_date', '>=', $dateFrom)
            ->where('expense_date', '<=', $dateTo)
            ->sum('amount');

        // Outstanding (finalized but unpaid invoices)
        $outstandingRevenue = Invoice::where('status', 'finalized')
            ->sum('grand_total');

        // Expenses by category
        $expensesByCategory = Expense::where('expense_date', '>=', $dateFrom)
            ->where('expense_date', '<=', $dateTo)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($r) => ['category' => $r->category, 'total' => (float) $r->total])
            ->values()
            ->toArray();

        // Daily revenue for trend chart
        $dailyRevenue = (clone $revenueQuery)
            ->select(DB::raw('DATE(payment_timestamp) as date'), DB::raw('SUM(amount_paid - COALESCE(refund_amount, 0)) as revenue'))
            ->groupBy(DB::raw('DATE(payment_timestamp)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'revenue' => round((float) $r->revenue, 2)])
            ->values()
            ->toArray();

        // Recent payments
        $recentPayments = Payment::with('member', 'invoice')
            ->orderByDesc('payment_timestamp')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'member_name' => $p->member ? ($p->member->first_name.' '.$p->member->last_name) : 'Unknown',
                'amount' => (float) $p->amount_paid,
                'refund_amount' => (float) ($p->refund_amount ?? 0),
                'method' => $p->payment_method,
                'date' => $p->payment_timestamp->format('Y-m-d H:i'),
                'is_refunded' => ! is_null($p->refunded_at),
            ])
            ->toArray();

        // Refund details
        $refundsList = Payment::whereNotNull('refunded_at')
            ->where('payment_timestamp', '>=', $dateFrom)
            ->where('payment_timestamp', '<=', $dateTo)
            ->with('member')
            ->orderByDesc('refunded_at')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'member_name' => $p->member ? ($p->member->first_name.' '.$p->member->last_name) : 'Unknown',
                'refund_amount' => (float) ($p->refund_amount ?? 0),
                'refund_reason' => $p->refund_reason,
                'refunded_at' => $p->refunded_at?->format('Y-m-d H:i'),
                'original_amount' => (float) $p->amount_paid,
            ])
            ->toArray();

        return [
            'total_revenue' => round($totalRevenue, 2),
            'gross_revenue' => round($grossRevenue, 2),
            'total_expenses' => round($totalExpenses, 2),
            'net_profit' => round($totalRevenue - $totalExpenses, 2),
            'outstanding_revenue' => round($outstandingRevenue, 2),
            'total_refunds' => round($totalRefunds, 2),
            'expenses_by_category' => $expensesByCategory,
            'daily_revenue' => $dailyRevenue,
            'recent_payments' => $recentPayments,
            'refunds_list' => $refundsList,
            'total_paid_invoices' => Invoice::where('status', 'paid')->count(),
            'total_finalized_invoices' => Invoice::where('status', 'finalized')->count(),
            'active_members' => Member::where('status', 'Active')->count(),
            'total_members' => Member::count(),
        ];
    }

    private function getRevenueByPlan(int $year, int $month): array
    {
        $dateFrom = "{$year}-{$month}-01";
        $dateTo = date('Y-m-t', strtotime($dateFrom));

        return Payment::where('payment_timestamp', '>=', $dateFrom)
            ->where('payment_timestamp', '<=', $dateTo)
            ->join('invoices', 'payments.invoice_id', '=', 'invoices.id')
            ->join('membership_plans', 'invoices.plan_id', '=', 'membership_plans.id')
            ->select('membership_plans.name', DB::raw('SUM(payments.amount_paid - COALESCE(payments.refund_amount, 0)) as revenue'))
            ->groupBy('membership_plans.name')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'revenue' => round((float) $r->revenue, 2)])
            ->toArray();
    }

    private function getMonthlyPnl(int $year): array
    {
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $dateFrom = "{$year}-".str_pad($m, 2, '0', STR_PAD_LEFT).'-01';
            $dateTo = date('Y-m-t', strtotime($dateFrom));

            $revenue = Payment::where('payment_timestamp', '>=', $dateFrom)
                ->where('payment_timestamp', '<=', $dateTo)
                ->sum(DB::raw('amount_paid - COALESCE(refund_amount, 0)'));

            $expenses = Expense::where('expense_date', '>=', $dateFrom)
                ->where('expense_date', '<=', $dateTo)
                ->sum('amount');

            $months[] = [
                'month' => date('M', strtotime($dateFrom)),
                'revenue' => round((float) $revenue, 2),
                'expenses' => round((float) $expenses, 2),
                'profit' => round((float) $revenue - (float) $expenses, 2),
            ];
        }

        return $months;
    }

    private function getDateRange(string $period, int $year, int $month): array
    {
        return match ($period) {
            'daily' => [now()->startOfDay(), now()->endOfDay()],
            'yearly' => ["{$year}-01-01", "{$year}-12-31"],
            default => ["{$year}-{$month}-01", date('Y-m-t', strtotime("{$year}-{$month}-01"))],
        };
    }
}
