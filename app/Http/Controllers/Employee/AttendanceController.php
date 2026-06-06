<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAttendanceLog;
use App\Models\StaffProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $staff = collect();

        if ($search) {
            $staff = StaffProfile::with('user', 'role')
                ->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->orderBy('id')
                ->get()
                ->map(function (StaffProfile $profile) {
                    $profile->today_clocked_in = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
                        ->whereDate('clock_in_timestamp', today())
                        ->exists();

                    $profile->can_clock_in = is_null($profile->current_attendance_id);
                    $profile->can_clock_out = ! is_null($profile->current_attendance_id);

                    return $profile;
                });
        }

        return Inertia::render('employee/attendance', [
            'staff' => $staff,
            'search' => $search,
        ]);
    }

    public function clockIn(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => ['required', 'exists:staff_profiles,id'],
        ]);

        $profile = StaffProfile::findOrFail($validated['staff_profile_id']);

        if ($profile->current_attendance_id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This staff member is already clocked in.']);

            return back();
        }

        if ($profile->employment_status !== 'Active') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Clock-in denied. Staff status is '{$profile->employment_status}'.",
            ]);

            return back();
        }

        $log = EmployeeAttendanceLog::create([
            'staff_profile_id' => $profile->id,
            'clock_in_timestamp' => now(),
            'clock_in_method' => 'Manual_Admin',
        ]);

        $profile->current_attendance_id = $log->id;
        $profile->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Staff clocked in successfully.']);

        return back();
    }

    public function clockOut(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'staff_profile_id' => ['required', 'exists:staff_profiles,id'],
        ]);

        $profile = StaffProfile::findOrFail($validated['staff_profile_id']);

        if (! $profile->current_attendance_id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This staff member is not currently clocked in.']);

            return back();
        }

        $log = EmployeeAttendanceLog::findOrFail($profile->current_attendance_id);
        $log->clock_out_timestamp = now();
        $log->save();

        $profile->current_attendance_id = null;
        $profile->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Staff clocked out successfully.']);

        return back();
    }
}
