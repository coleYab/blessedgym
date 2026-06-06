<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\StaffLeaveRequest;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(): Response
    {
        $requests = StaffLeaveRequest::with('staffProfile.user', 'approver.user')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->through(fn (StaffLeaveRequest $r) => [
                'id' => $r->id,
                'staff_profile_id' => $r->staff_profile_id,
                'staff_name' => $r->staffProfile?->user?->name ?? 'Unknown',
                'staff_email' => $r->staffProfile?->user?->email ?? '',
                'leave_type' => $r->leave_type,
                'status' => $r->status,
                'start_date' => $r->start_date->format('Y-m-d'),
                'end_date' => $r->end_date->format('Y-m-d'),
                'reason' => $r->reason,
                'approved_by_name' => $r->approver?->user?->name ?? null,
                'approved_at' => $r->approved_at?->format('Y-m-d H:i'),
                'denial_reason' => $r->denial_reason,
                'created_at' => $r->created_at->format('Y-m-d H:i'),
            ]);

        $staff = StaffProfile::with('user')
            ->orderBy(
                User::select('name')->whereColumn('users.id', 'staff_profiles.user_id')
            )
            ->get(['id', 'user_id'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Unknown',
            ]);

        $managerStaff = StaffProfile::with('user')
            ->whereHas('role', fn ($q) => $q->whereIn('slug', ['manager', 'admin']))
            ->get(['id', 'user_id'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Unknown',
            ]);

        return Inertia::render('employee/leave', [
            'requests' => $requests,
            'staff' => $staff,
            'managerStaff' => $managerStaff,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => ['required', 'exists:staff_profiles,id'],
            'leave_type' => ['required', 'string', 'in:Sick,Vacation,Personal,Family_Emergency,Other'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $existing = StaffLeaveRequest::where('staff_profile_id', $validated['staff_profile_id'])
            ->where('status', 'Approved')
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                    ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                    ->orWhere(function ($q2) use ($validated) {
                        $q2->where('start_date', '<=', $validated['start_date'])
                            ->where('end_date', '>=', $validated['end_date']);
                    });
            })->exists();

        if ($existing) {
            return back()->withErrors(['overlap' => 'This staff member already has approved leave for overlapping dates.']);
        }

        StaffLeaveRequest::create($validated);

        return back();
    }

    public function approve(Request $request, StaffLeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'approved_by' => ['required', 'exists:staff_profiles,id'],
        ]);

        if ($leaveRequest->status !== 'Pending') {
            return back()->withErrors(['status' => 'Only pending requests can be approved.']);
        }

        $leaveRequest->update([
            'status' => 'Approved',
            'approved_by' => $validated['approved_by'],
            'approved_at' => now(),
            'denial_reason' => null,
        ]);

        return back();
    }

    public function deny(Request $request, StaffLeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'denial_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($leaveRequest->status !== 'Pending') {
            return back()->withErrors(['status' => 'Only pending requests can be denied.']);
        }

        $leaveRequest->update([
            'status' => 'Denied',
            'approved_by' => null,
            'approved_at' => null,
            'denial_reason' => $validated['denial_reason'] ?? null,
        ]);

        return back();
    }

    public function destroy(StaffLeaveRequest $leaveRequest): RedirectResponse
    {
        $leaveRequest->delete();

        return back();
    }
}
