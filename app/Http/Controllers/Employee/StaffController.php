<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = StaffProfile::with('user', 'role');

        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter) {
            $query->where('role_id', $roleFilter);
        }

        $staff = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function (StaffProfile $profile) {
                $profile->profile_photo_url = $profile->profile_photo_path
                    ? Storage::url($profile->profile_photo_path)
                    : null;

                return $profile;
            });

        $roles = Role::orderBy('name')->get();

        return Inertia::render('employee/staff', [
            'staff' => $staff,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $query = $request->input('q');

        $users = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%");
        })
            ->whereDoesntHave('staffProfile')
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json($users);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id', 'unique:staff_profiles,user_id'],
            'role_id' => ['required', 'exists:roles,id'],
            'employment_status' => ['required', 'string', 'in:Active,Suspended,Terminated'],
            'hired_date' => ['required', 'date'],
            'specialties' => ['nullable', 'array'],
            'specialties.*' => ['string', 'max:255'],
            'base_hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $data = [
            'user_id' => $validated['user_id'],
            'role_id' => $validated['role_id'],
            'employment_status' => $validated['employment_status'],
            'hired_date' => $validated['hired_date'],
            'specialties' => $validated['specialties'] ?? null,
            'base_hourly_rate' => $validated['base_hourly_rate'] ?? null,
            'currency' => $validated['currency'],
        ];

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $request->file('profile_photo')->store('staff-photos', 'public');
        }

        StaffProfile::create($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Staff profile created successfully.',
        ]);

        return to_route('employee.staff');
    }

    public function update(Request $request, StaffProfile $staffProfile): RedirectResponse
    {
        $validated = $request->validate([
            'role_id' => ['required', 'exists:roles,id'],
            'employment_status' => ['required', 'string', 'in:Active,Suspended,Terminated'],
            'hired_date' => ['required', 'date'],
            'specialties' => ['nullable', 'array'],
            'specialties.*' => ['string', 'max:255'],
            'base_hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $data = [
            'role_id' => $validated['role_id'],
            'employment_status' => $validated['employment_status'],
            'hired_date' => $validated['hired_date'],
            'specialties' => $validated['specialties'] ?? null,
            'base_hourly_rate' => $validated['base_hourly_rate'] ?? null,
            'currency' => $validated['currency'],
        ];

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $request->file('profile_photo')->store('staff-photos', 'public');
        }

        $staffProfile->update($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Staff profile updated successfully.',
        ]);

        return to_route('employee.staff');
    }

    public function destroy(StaffProfile $staffProfile): RedirectResponse
    {
        $staffProfile->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Staff profile removed.',
        ]);

        return to_route('employee.staff');
    }
}
