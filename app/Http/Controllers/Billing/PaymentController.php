<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Member;
use App\Models\MembershipPlan;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $payments = Payment::with('member', 'plan')
            ->orderBy('created_at', 'desc')
            ->get();

        $plans = MembershipPlan::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'base_price' => (float) $plan->base_price,
                'duration_value' => $plan->duration_value,
                'duration_unit' => $plan->duration_unit,
                'currency' => $plan->currency,
            ]);

        $members = Member::query()
            ->select('id', 'first_name', 'last_name', 'email', 'status')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('billing/payments', [
            'payments' => $payments,
            'plans' => $plans,
            'members' => $members,
        ]);
    }

    public function history(Request $request): Response
    {
        $query = Payment::with('member', 'plan');

        if ($request->filled('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_timestamp', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_timestamp', '<=', $request->date_to);
        }

        if ($request->filled('refund_status')) {
            match ($request->refund_status) {
                'refunded' => $query->whereNotNull('refunded_at'),
                'none' => $query->whereNull('refunded_at'),
                default => null,
            };
        }

        $payments = $query->orderBy('payment_timestamp', 'desc')
            ->paginate(50)
            ->withQueryString();

        $members = Member::query()
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('billing/history', [
            'payments' => $payments,
            'members' => $members,
            'filters' => $request->only(['member_id', 'method', 'date_from', 'date_to', 'refund_status']),
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $payment = Payment::create($data);

        $this->applyPostPaymentEffects($payment);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Payment of $'.number_format((float) $data['amount_paid'], 2).' recorded successfully.',
        ]);

        return to_route('billing.payments');
    }

    private function applyPostPaymentEffects(Payment $payment): void
    {
        $payment->load('member', 'plan');

        $member = $payment->member;
        $plan = $payment->plan;

        if (! $member || ! $plan) {
            return;
        }

        $memberData = [
            'status' => 'Active',
            'current_plan_id' => $plan->id,
            'freeze_start_date' => null,
            'freeze_end_date' => null,
            'freeze_reason' => null,
            'cancellation_requested_date' => null,
            'effective_cancellation_date' => null,
            'cancellation_reason' => null,
            'start_date' => now()->toDateString(),
            'end_date' => $this->calculateEndDateFromPayment($payment),
        ];

        $member->update($memberData);
    }

    private function calculateEndDateFromPayment(Payment $payment): string
    {
        return match ($payment->duration_unit) {
            'days' => now()->addDays($payment->duration_value)->toDateString(),
            'weeks' => now()->addWeeks($payment->duration_value)->toDateString(),
            'months' => now()->addMonths($payment->duration_value)->toDateString(),
            'years' => now()->addYears($payment->duration_value)->toDateString(),
            default => now()->toDateString(),
        };
    }

    public function refund(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'refund_reason' => ['required', 'string', 'max:1000'],
            'refund_amount' => ['required', 'numeric', 'min:0.01', 'max:'.$payment->amount_paid],
        ]);

        if ($payment->refunded_at) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This payment has already been refunded.',
            ]);

            return back();
        }

        $payment->update([
            'refunded_at' => now(),
            'refund_amount' => $validated['refund_amount'],
            'refund_reason' => $validated['refund_reason'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Refund of $'.number_format((float) $validated['refund_amount'], 2).' processed successfully.',
        ]);

        return to_route('billing.payments');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $payment->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Payment record deleted.',
        ]);

        return to_route('billing.payments');
    }
}
