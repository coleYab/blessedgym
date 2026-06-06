<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\MembershipFreeze;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FreezeController extends Controller
{
    private const MAX_FREEZE_DAYS_PER_YEAR = 30;

    public function index(): Response
    {
        $freezes = MembershipFreeze::with('member')
            ->orderBy('created_at', 'desc')
            ->get();

        $members = Member::query()
            ->select('id', 'first_name', 'last_name', 'email', 'status', 'end_date')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('billing/freeze', [
            'freezes' => $freezes,
            'members' => $members,
            'maxFreezeDays' => self::MAX_FREEZE_DAYS_PER_YEAR,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'freeze_reason' => ['required', 'string', Rule::in(['Medical_Injury', 'Travel', 'Personal'])],
            'scheduled_unfreeze_date' => ['required', 'date', 'after:today'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if ($member->status !== 'Active') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Only active members can be frozen.']);

            return back();
        }

        $frozenDays = (int) now()->diffInDays($validated['scheduled_unfreeze_date']);

        $totalFrozenThisYear = MembershipFreeze::where('member_id', $member->id)
            ->whereYear('freeze_initiated_at', now()->year)
            ->sum('total_days_paused');

        if (($totalFrozenThisYear + $frozenDays) > self::MAX_FREEZE_DAYS_PER_YEAR) {
            $remaining = max(self::MAX_FREEZE_DAYS_PER_YEAR - $totalFrozenThisYear, 0);

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Cannot freeze. Max {$remaining} freeze days remaining this year (limit: {$frozenDays} requested, {$totalFrozenThisYear} already used).",
            ]);

            return back();
        }

        MembershipFreeze::create([
            'member_id' => $member->id,
            'freeze_initiated_at' => now(),
            'scheduled_unfreeze_date' => $validated['scheduled_unfreeze_date'],
            'total_days_paused' => $frozenDays,
            'freeze_reason' => $validated['freeze_reason'],
            'authorized_by_staff_id' => $request->user()->id,
        ]);

        $member->update([
            'status' => 'Frozen',
            'freeze_reason' => $validated['freeze_reason'],
            'freeze_start_date' => now()->toDateString(),
            'freeze_end_date' => $validated['scheduled_unfreeze_date'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Membership frozen for {$frozenDays} days (until {$validated['scheduled_unfreeze_date']}).",
        ]);

        return to_route('billing.freeze');
    }

    public function unfreeze(Member $member): RedirectResponse
    {
        if ($member->status !== 'Frozen') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Only frozen members can be unfrozen.']);

            return back();
        }

        $activeFreeze = MembershipFreeze::where('member_id', $member->id)
            ->whereNull('actual_unfreeze_timestamp')
            ->latest('freeze_initiated_at')
            ->first();

        $pausedDays = $activeFreeze
            ? (int) $activeFreeze->freeze_initiated_at->diffInDays(now())
            : 0;

        if ($activeFreeze) {
            $activeFreeze->update([
                'actual_unfreeze_timestamp' => now(),
                'total_days_paused' => $pausedDays,
            ]);
        }

        $extendDays = $pausedDays;
        $newEndDate = null;

        if ($member->end_date) {
            $newEndDate = date('Y-m-d', strtotime($member->end_date." +{$extendDays} days"));
        }

        $member->update([
            'status' => 'Active',
            'end_date' => $newEndDate,
            'freeze_reason' => null,
            'freeze_start_date' => null,
            'freeze_end_date' => null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Membership reactivated. End date extended by {$extendDays} days".($newEndDate ? " to {$newEndDate}." : '.'),
        ]);

        return to_route('billing.freeze');
    }
}
