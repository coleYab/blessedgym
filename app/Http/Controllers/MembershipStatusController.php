<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MembershipPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipStatusController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status');

        $query = Member::with('currentPlan')->orderBy('first_name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $members = $query->get()->map(function (Member $member) {
            $member->active_session = ! is_null($member->current_session_id);

            return $member;
        });

        $plans = MembershipPlan::where('is_active', true)->get();

        return Inertia::render('membership/status', [
            'members' => $members,
            'plans' => $plans,
            'search' => $search,
            'statusFilter' => $statusFilter,
        ]);
    }

    public function freeze(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'freeze_reason' => ['required', 'string', Rule::in(['Medical', 'Travel', 'Financial', 'Injury'])],
            'freeze_start_date' => ['required', 'date'],
            'freeze_end_date' => ['required', 'date', 'after_or_equal:freeze_start_date'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if ($member->status !== 'Active') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Only active members can be frozen.']);

            return back();
        }

        $member->update([
            'status' => 'Frozen',
            'freeze_reason' => $validated['freeze_reason'],
            'freeze_start_date' => $validated['freeze_start_date'],
            'freeze_end_date' => $validated['freeze_end_date'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Membership frozen successfully.']);

        return back();
    }

    public function unfreeze(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if ($member->status !== 'Frozen') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Only frozen members can be unfrozen.']);

            return back();
        }

        $member->update([
            'status' => 'Active',
            'freeze_reason' => null,
            'freeze_start_date' => null,
            'freeze_end_date' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Membership reactivated successfully.']);

        return back();
    }

    public function cancel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'cancellation_reason' => ['required', 'string', 'max:1000'],
            'effective_cancellation_date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if (! in_array($member->status, ['Active', 'Frozen'])) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This membership cannot be cancelled in its current state.']);

            return back();
        }

        $member->update([
            'status' => 'Cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
            'cancellation_requested_date' => now(),
            'effective_cancellation_date' => $validated['effective_cancellation_date'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Membership cancelled successfully.']);

        return back();
    }

    public function modify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
            'status' => ['required', Rule::in(['Active', 'Expired', 'Frozen', 'Cancelled'])],
            'current_plan_id' => ['nullable', 'exists:membership_plans,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        $update = [
            'status' => $validated['status'],
        ];

        if (array_key_exists('current_plan_id', $validated)) {
            $update['current_plan_id'] = $validated['current_plan_id'];
        }

        if (array_key_exists('start_date', $validated)) {
            $update['start_date'] = $validated['start_date'];
        }

        if (array_key_exists('end_date', $validated)) {
            $update['end_date'] = $validated['end_date'];
        }

        if ($validated['status'] === 'Active') {
            $update['freeze_reason'] = null;
            $update['freeze_start_date'] = null;
            $update['freeze_end_date'] = null;
            $update['cancellation_reason'] = null;
            $update['cancellation_requested_date'] = null;
            $update['effective_cancellation_date'] = null;
        }

        $member->update($update);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Membership updated successfully.']);

        return back();
    }
}
