<?php

namespace App\Http\Controllers;

use App\Models\CheckinLog;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CheckinController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $members = collect();

        if ($search) {
            $members = Member::where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            })
                ->orderBy('first_name')
                ->with('currentPlan')
                ->get()
                ->map(function (Member $member) {
                    $member->today_sessions_count = CheckinLog::where('member_id', $member->id)
                        ->whereDate('check_in_timestamp', today())
                        ->count();

                    $hasValidPlan = $member->hasValidPlan();
                    $member->plan_name = $member->currentPlan?->name;

                    $member->can_checkin = $hasValidPlan
                        && $member->today_sessions_count < 2
                        && is_null($member->current_session_id);

                    $member->can_checkout = ! is_null($member->current_session_id);

                    if (! $hasValidPlan) {
                        $member->denial_reason = 'No valid plan. This member has no active paid membership.';
                    } elseif ($member->today_sessions_count >= 2) {
                        $member->denial_reason = 'Maximum of 2 sessions reached for today.';
                    } elseif ($member->current_session_id) {
                        $member->denial_reason = 'Member is already checked in.';
                    } else {
                        $member->denial_reason = null;
                    }

                    $member->profile_photo_url = $member->profile_photo_path
                        ? Storage::url($member->profile_photo_path)
                        : null;

                    $member->id_document_url = $member->id_document_path
                        ? Storage::url($member->id_document_path)
                        : null;

                    return $member;
                });
        }

        return Inertia::render('membership/checkin', [
            'members' => $members,
            'search' => $search,
        ]);
    }

    public function checkin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if ($member->current_session_id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This member is already checked in.']);

            return back();
        }

        if (! $member->hasValidPlan()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Check-in denied. This member has no valid paid membership plan.',
            ]);

            return back();
        }

        $todaySessions = CheckinLog::where('member_id', $member->id)
            ->whereDate('check_in_timestamp', today())
            ->count();

        if ($todaySessions >= 2) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This member has reached the maximum of 2 sessions for today.',
            ]);

            return back();
        }

        $log = CheckinLog::create([
            'member_id' => $member->id,
            'check_in_timestamp' => now(),
            'check_in_method' => 'Manual_Admin',
        ]);

        $member->current_session_id = $log->id;
        $member->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Member checked in successfully.']);

        return back();
    }

    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'exists:members,id'],
        ]);

        $member = Member::findOrFail($validated['member_id']);

        if (! $member->current_session_id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This member is not currently checked in.']);

            return back();
        }

        $log = CheckinLog::findOrFail($member->current_session_id);
        $log->check_out_timestamp = now();
        $log->save();

        $member->current_session_id = null;
        $member->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Member checked out successfully.']);

        return back();
    }
}
