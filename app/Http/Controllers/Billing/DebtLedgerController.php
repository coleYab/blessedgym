<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\DebtLedger;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DebtLedgerController extends Controller
{
    private const GRACE_PERIOD_DAYS = 7;

    public function index(): Response
    {
        $ledger = DebtLedger::with('member')
            ->orderByRaw('CASE WHEN payment_urgency_status = ? THEN 0 WHEN payment_urgency_status = ? THEN 1 ELSE 2 END', [
                'Suspended_Non_Payment', 'Overdue_Grace_Period',
            ])
            ->orderBy('days_overdue', 'desc')
            ->get();

        return Inertia::render('billing/balances', [
            'ledger' => $ledger,
            'gracePeriodDays' => self::GRACE_PERIOD_DAYS,
        ]);
    }

    public function recalculate(): RedirectResponse
    {
        $members = Member::all();

        foreach ($members as $member) {
            $this->recalculateForMember($member);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Debt ledger recalculated for all members.',
        ]);

        return to_route('billing.balances');
    }

    public function recalculateMember(Member $member): RedirectResponse
    {
        $this->recalculateForMember($member);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Debt ledger updated for {$member->first_name} {$member->last_name}.",
        ]);

        return to_route('billing.balances');
    }

    private function recalculateForMember(Member $member): void
    {
        $totalInvoiced = (float) Invoice::whereHas('member', fn ($q) => $q->where('members.id', $member->id))
            ->where('status', 'finalized')
            ->sum('grand_total');

        $totalPaid = (float) Payment::where('member_id', $member->id)
            ->sum('amount_paid');

        $outstanding = max($totalInvoiced - $totalPaid, 0);

        $daysOverdue = 0;
        if ($outstanding > 0) {
            $overdueInvoice = Invoice::where('member_id', $member->id)
                ->where('status', 'finalized')
                ->where('due_date', '<', now())
                ->orderBy('due_date', 'asc')
                ->first();

            if ($overdueInvoice) {
                $daysOverdue = (int) $overdueInvoice->due_date->diffInDays(now());
            }
        }

        $status = 'Settled';
        if ($outstanding > 0 && $daysOverdue > self::GRACE_PERIOD_DAYS) {
            $status = 'Suspended_Non_Payment';
        } elseif ($outstanding > 0 && $daysOverdue > 0) {
            $status = 'Overdue_Grace_Period';
        }

        DebtLedger::updateOrCreate(
            ['member_id' => $member->id],
            [
                'total_invoiced_amount' => $totalInvoiced,
                'total_paid_amount' => $totalPaid,
                'outstanding_balance' => $outstanding,
                'days_overdue' => $daysOverdue,
                'payment_urgency_status' => $status,
                'last_status_update' => now(),
            ],
        );

        if ($status === 'Suspended_Non_Payment' && $member->status === 'Active') {
            $member->update(['status' => 'Expired']);
        } elseif ($status === 'Settled' && $member->status === 'Expired') {
            $member->update(['status' => 'Active']);
        }
    }
}
