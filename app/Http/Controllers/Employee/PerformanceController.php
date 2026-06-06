<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeAttendanceLog;
use App\Models\StaffProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceController extends Controller
{
    public function index(Request $request): Response
    {
        $staffProfileId = $request->input('staff_profile_id');
        $period = (int) ($request->input('period', 30));
        $globalData = [];
        $employeeData = null;
        $selectedProfile = null;

        if ($staffProfileId) {
            $profile = StaffProfile::with('user', 'role')->find($staffProfileId);
            if ($profile) {
                $selectedProfile = $profile;
                $employeeData = $this->getEmployeeAnalytics($profile, $period);
            }
        }

        if (! $staffProfileId) {
            $globalData = $this->getGlobalAnalytics($period);
        }

        $staff = StaffProfile::with('user')
            ->orderBy(
                DB::raw('(SELECT name FROM users WHERE users.id = staff_profiles.user_id)')
            )
            ->get(['id', 'user_id']);

        return Inertia::render('employee/performance', [
            'globalData' => $globalData,
            'employeeData' => $employeeData,
            'selectedProfile' => $selectedProfile ? [
                'id' => $selectedProfile->id,
                'name' => $selectedProfile->user?->name ?? 'Unknown',
                'email' => $selectedProfile->user?->email ?? '',
                'role' => $selectedProfile->role?->name ?? null,
            ] : null,
            'staff' => $staff->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Unknown',
                'email' => $s->user?->email ?? '',
            ]),
            'period' => $period,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');
        if (! $query || strlen($query) < 1) {
            return response()->json([]);
        }

        $staff = StaffProfile::with('user')
            ->whereHas('user', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(20)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->user?->name ?? 'Unknown',
                'email' => $s->user?->email ?? '',
            ]);

        return response()->json($staff);
    }

    private function getGlobalAnalytics(int $period): array
    {
        $cutoff = now()->subDays($period);

        $completedLogs = EmployeeAttendanceLog::whereNotNull('clock_out_timestamp')
            ->where('clock_in_timestamp', '>=', $cutoff);

        $todayLogs = EmployeeAttendanceLog::whereDate('clock_in_timestamp', today());

        $nowClockedIn = StaffProfile::whereNotNull('current_attendance_id')->count();

        $totalHours = (clone $completedLogs)->get()->sum(fn ($log) => max(0, $log->clock_in_timestamp->diffInMinutes($log->clock_out_timestamp) / 60));
        $completedCount = (clone $completedLogs)->count();
        $avgHoursPerShift = $completedCount > 0 ? round($totalHours / $completedCount, 2) : 0;

        $totalCheckins = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)->count();
        $todayCheckins = (clone $todayLogs)->count();

        $uniqueStaff = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)
            ->distinct('staff_profile_id')->count('staff_profile_id');
        $todayUnique = (clone $todayLogs)->distinct('staff_profile_id')->count('staff_profile_id');

        $avgDailyCheckins = $period > 0 ? round($totalCheckins / $period, 1) : 0;

        // status & role breakdown
        $statusBreakdown = StaffProfile::select('employment_status', DB::raw('COUNT(*) as count'))
            ->groupBy('employment_status')->get()
            ->map(fn ($r) => ['name' => $r->employment_status, 'value' => (int) $r->count])
            ->values()->toArray();

        $roleBreakdown = StaffProfile::select(DB::raw('(SELECT name FROM roles WHERE roles.id = staff_profiles.role_id) as name'), DB::raw('COUNT(*) as count'))
            ->groupBy('role_id')->get()
            ->map(fn ($r) => ['name' => $r->name ?? 'Unassigned', 'value' => (int) $r->count])
            ->values()->toArray();

        // daily active staff (unique per day)
        $dailyActive = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)
            ->select(DB::raw('date(clock_in_timestamp) as date'), DB::raw('COUNT(DISTINCT staff_profile_id) as active_count'))
            ->groupBy(DB::raw('date(clock_in_timestamp)'))
            ->orderBy('date')->get();

        $dateRange = collect();
        for ($i = $period; $i >= 0; $i--) {
            $dateRange->push(now()->subDays($i)->format('Y-m-d'));
        }

        $dailyActiveData = $dateRange->map(function ($date) use ($dailyActive) {
            $row = $dailyActive->firstWhere('date', $date);

            return ['date' => $date, 'active_staff' => $row ? (int) $row->active_count : 0];
        })->values()->toArray();

        // weekly clock-ins
        $weeklyRaw = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)
            ->select(
                DB::raw("strftime('%Y-%W', clock_in_timestamp) as week"),
                DB::raw('COUNT(*) as checkins')
            )
            ->groupBy(DB::raw("strftime('%Y-%W', clock_in_timestamp)"))
            ->orderBy('week')->get();

        $weeklyData = $weeklyRaw->map(fn ($r) => [
            'week' => $r->week,
            'checkins' => (int) $r->checkins,
        ])->values()->toArray();

        // peak hours
        $peakHoursRaw = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)
            ->select(
                DB::raw("strftime('%H', clock_in_timestamp) as hour"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw("strftime('%H', clock_in_timestamp)"))
            ->orderBy('hour')->get();

        $peakHours = collect(range(0, 23))->map(function ($hour) use ($peakHoursRaw) {
            $row = $peakHoursRaw->firstWhere(fn ($r) => (int) $r->hour === $hour);

            return [
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'count' => $row ? (int) $row->count : 0,
            ];
        })->values()->toArray();

        // day of week
        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $dowRaw = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $cutoff)
            ->select(
                DB::raw("strftime('%w', clock_in_timestamp) as day"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw("strftime('%w', clock_in_timestamp)"))
            ->get();

        $dowData = collect(range(0, 6))->map(function ($day) use ($dowRaw, $dayNames) {
            $row = $dowRaw->firstWhere(fn ($r) => (int) $r->day === $day);

            return ['day' => $dayNames[$day], 'count' => $row ? (int) $row->count : 0];
        })->values()->toArray();

        // duration distribution
        $durationBuckets = (clone $completedLogs)->get()->groupBy(function ($r) {
            $mins = max(0, $r->clock_in_timestamp->diffInMinutes($r->clock_out_timestamp));

            return match (true) {
                $mins < 120 => '<2h',
                $mins < 240 => '2-4h',
                $mins < 360 => '4-6h',
                $mins < 480 => '6-8h',
                $mins < 600 => '8-10h',
                default => '10h+',
            };
        });

        $durationLabels = ['<2h', '2-4h', '4-6h', '6-8h', '8-10h', '10h+'];
        $durationData = collect($durationLabels)->map(fn ($label) => [
            'range' => $label,
            'count' => $durationBuckets->get($label)?->count() ?? 0,
        ])->values()->toArray();

        // staff growth (cumulative hiring)
        $growthRaw = StaffProfile::select(DB::raw('date(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy('date')->get();

        $cumulative = 0;
        $growthData = $growthRaw->map(function ($r) use (&$cumulative) {
            $cumulative += (int) $r->count;

            return ['date' => $r->date, 'total_staff' => $cumulative];
        })->values()->toArray();

        // heatmap (last 90 days)
        $heatmapCutoff = now()->subDays(90);
        $heatmapRaw = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $heatmapCutoff)
            ->select(
                DB::raw("strftime('%w', clock_in_timestamp) as day_of_week"),
                DB::raw("strftime('%H', clock_in_timestamp) as hour"),
                DB::raw('COUNT(*) as check_ins'),
            )
            ->groupBy(
                DB::raw("strftime('%w', clock_in_timestamp)"),
                DB::raw("strftime('%H', clock_in_timestamp)")
            )
            ->get();

        $heatmapData = collect(range(0, 6))->flatMap(fn ($day) => collect(range(0, 23))->map(function ($hour) use ($heatmapRaw, $day, $dayNames) {
            $row = $heatmapRaw->firstWhere(fn ($r) => (int) $r->day_of_week === $day && (int) $r->hour === $hour);

            return [
                'day' => $dayNames[$day],
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'average_check_ins' => $row ? (int) $row->check_ins : 0,
            ];
        }))->values()->toArray();

        // monthly trend
        $twoYearsBack = now()->subYears(2);
        $monthlyRaw = EmployeeAttendanceLog::where('clock_in_timestamp', '>=', $twoYearsBack)
            ->select(
                DB::raw("strftime('%m', clock_in_timestamp) as month"),
                DB::raw("strftime('%Y', clock_in_timestamp) as year"),
                DB::raw('COUNT(DISTINCT staff_profile_id) as unique_staff'),
            )
            ->groupBy(
                DB::raw("strftime('%Y', clock_in_timestamp)"),
                DB::raw("strftime('%m', clock_in_timestamp)")
            )
            ->orderBy('year')->orderBy('month')->get();

        $currentYear = now()->year;
        $lastYear = $currentYear - 1;
        $monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        $monthlyTrend = array_map(function ($monthIdx) use ($monthlyRaw, $currentYear, $lastYear, $monthLabels) {
            $month = str_pad($monthIdx + 1, 2, '0', STR_PAD_LEFT);
            $current = $monthlyRaw->firstWhere(fn ($r) => $r->year === (string) $currentYear && $r->month === $month);
            $previous = $monthlyRaw->firstWhere(fn ($r) => $r->year === (string) $lastYear && $r->month === $month);

            return [
                'month' => $monthLabels[$monthIdx],
                'current_year' => $current ? (int) $current->unique_staff : 0,
                'previous_year' => $previous ? (int) $previous->unique_staff : 0,
            ];
        }, array_keys($monthLabels));

        return [
            'heatmap' => $heatmapData,
            'monthly_trend' => $monthlyTrend,
            'daily_active' => $dailyActiveData,
            'weekly_checkins' => $weeklyData,
            'peak_hours' => $peakHours,
            'day_of_week' => $dowData,
            'staff_growth' => $growthData,
            'duration_distribution' => $durationData,
            'status_breakdown' => $statusBreakdown,
            'role_breakdown' => $roleBreakdown,
            'kpi' => [
                'total_staff' => StaffProfile::count(),
                'active_today' => $nowClockedIn,
                'checkins_today' => $todayCheckins,
                'unique_staff_today' => $todayUnique,
                'total_checkins_period' => $totalCheckins,
                'unique_staff_period' => $uniqueStaff,
                'avg_daily_checkins' => $avgDailyCheckins,
                'avg_hours_per_shift' => $avgHoursPerShift,
                'total_hours_period' => round($totalHours, 1),
            ],
        ];
    }

    private function getEmployeeAnalytics(StaffProfile $profile, int $period): array
    {
        $cutoff = now()->subDays($period);
        $oneYearBack = now()->subYear();

        $logs = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->whereNotNull('clock_out_timestamp')
            ->where('clock_in_timestamp', '>=', $oneYearBack)
            ->orderBy('clock_in_timestamp')
            ->get();

        // attendance dates with durations
        $attendanceDates = $logs->map(fn ($log) => [
            'date' => $log->clock_in_timestamp->format('Y-m-d'),
            'hours_worked' => round(max(0, $log->clock_in_timestamp->diffInMinutes($log->clock_out_timestamp) / 60), 2),
        ])->values()->toArray();

        // daily unique attendance
        $dailyAttendance = collect($attendanceDates)->groupBy('date')->map(fn ($entries, $date) => [
            'date' => $date,
            'hours_worked' => collect($entries)->sum('hours_worked'),
        ])->values()->toArray();

        // favorite days
        $favoriteDaysRaw = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->select(
                DB::raw("strftime('%w', clock_in_timestamp) as day_of_week"),
                DB::raw('COUNT(*) as visit_count'),
                DB::raw("AVG(CAST(strftime('%H', clock_in_timestamp) AS REAL) + CAST(strftime('%M', clock_in_timestamp) AS REAL) / 60.0) as avg_arrival_hour"),
            )
            ->groupBy(DB::raw("strftime('%w', clock_in_timestamp)"))
            ->get();

        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $favoriteDaysData = collect(range(0, 6))->map(function ($day) use ($favoriteDaysRaw, $dayNames) {
            $row = $favoriteDaysRaw->firstWhere(fn ($r) => (int) $r->day_of_week === $day);

            return [
                'day' => $dayNames[$day],
                'visit_count' => $row ? (int) $row->visit_count : 0,
                'avg_arrival_hour' => $row ? round((float) $row->avg_arrival_hour, 1) : 0,
            ];
        })->values()->toArray();

        // hours trend (monthly)
        $monthlyHoursRaw = $logs->where('clock_in_timestamp', '>=', $oneYearBack)
            ->groupBy(fn ($log) => $log->clock_in_timestamp->format('Y-m'))
            ->map(fn ($entries, $month) => [
                'month' => $month,
                'total_hours' => round($entries->sum(fn ($e) => max(0, $e->clock_in_timestamp->diffInMinutes($e->clock_out_timestamp) / 60)), 1),
                'days_worked' => $entries->count(),
            ])
            ->sortBy('month')
            ->values()
            ->toArray();

        // clock-in hour distribution
        $visitHoursRaw = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->where('clock_in_timestamp', '>=', $cutoff)
            ->select(
                DB::raw("strftime('%H', clock_in_timestamp) as hour"),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw("strftime('%H', clock_in_timestamp)"))
            ->orderBy('hour')->get();

        $visitHourDist = collect(range(0, 23))->map(function ($hour) use ($visitHoursRaw) {
            $row = $visitHoursRaw->firstWhere(fn ($r) => (int) $r->hour === $hour);

            return [
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'count' => $row ? (int) $row->count : 0,
            ];
        })->values()->toArray();

        // weekly comparison
        $thisWeekStart = now()->startOfWeek();
        $lastWeekStart = (clone $thisWeekStart)->subWeek();
        $thisWeekHours = $logs->where('clock_in_timestamp', '>=', $thisWeekStart)
            ->sum(fn ($e) => max(0, $e->clock_in_timestamp->diffInMinutes($e->clock_out_timestamp) / 60));
        $lastWeekHours = $logs->where('clock_in_timestamp', '>=', $lastWeekStart)
            ->where('clock_in_timestamp', '<', $thisWeekStart)
            ->sum(fn ($e) => max(0, $e->clock_in_timestamp->diffInMinutes($e->clock_out_timestamp) / 60));
        $thisWeekDays = $logs->where('clock_in_timestamp', '>=', $thisWeekStart)
            ->unique(fn ($e) => $e->clock_in_timestamp->format('Y-m-d'))->count();
        $lastWeekDays = $logs->where('clock_in_timestamp', '>=', $lastWeekStart)
            ->where('clock_in_timestamp', '<', $thisWeekStart)
            ->unique(fn ($e) => $e->clock_in_timestamp->format('Y-m-d'))->count();

        // streaks (consecutive days worked)
        $streakDates = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->select(DB::raw('date(clock_in_timestamp) as date'))
            ->distinct()->orderByDesc('date')->get()->pluck('date');

        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;
        $checkDate = today();

        foreach ($streakDates as $date) {
            if ($date === $checkDate->format('Y-m-d')) {
                $currentStreak++;
                $checkDate->subDay();
            } else {
                break;
            }
        }

        $prevDate = null;
        foreach ($streakDates->sort() as $date) {
            if ($prevDate === null) {
                $tempStreak = 1;
            } else {
                $diff = (new \DateTime($date))->diff(new \DateTime($prevDate))->days;
                if ($diff === 1) {
                    $tempStreak++;
                } else {
                    $longestStreak = max($longestStreak, $tempStreak);
                    $tempStreak = 1;
                }
            }
            $prevDate = $date;
        }
        $longestStreak = max($longestStreak, $tempStreak);

        // period metrics
        $periodLogs = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->where('clock_in_timestamp', '>=', $cutoff);

        $completedPeriod = (clone $periodLogs)->whereNotNull('clock_out_timestamp');
        $periodTotalShifts = (clone $completedPeriod)->count();
        $periodTotalHours = (clone $completedPeriod)->get()->sum(fn ($e) => max(0, $e->clock_in_timestamp->diffInMinutes($e->clock_out_timestamp) / 60));
        $periodAvgShiftHours = $periodTotalShifts > 0 ? round($periodTotalHours / $periodTotalShifts, 1) : 0;
        $periodDaysWorked = (clone $completedPeriod)->distinct()->count(DB::raw('date(clock_in_timestamp)'));

        // consistency score
        $daysInPeriod = max(1, $period);
        $consistencyScore = min(100, round(($periodDaysWorked / $daysInPeriod) * 100));

        // average hours per day
        $avgHoursPerDay = $periodDaysWorked > 0 ? round($periodTotalHours / $periodDaysWorked, 1) : 0;

        // lifetime metrics
        $lifetimeLogs = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)->whereNotNull('clock_out_timestamp');
        $lifetimeShifts = (clone $lifetimeLogs)->count();
        $lifetimeHours = (clone $lifetimeLogs)->get()->sum(fn ($e) => max(0, $e->clock_in_timestamp->diffInMinutes($e->clock_out_timestamp) / 60));
        $firstShift = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)->min('clock_in_timestamp');
        $tenureDays = $firstShift ? max(1, now()->diffInDays($firstShift)) : 1;
        $avgHoursPerWeek = round(($lifetimeHours / $tenureDays) * 7, 1);

        // punctuality — avg arrival hour variance
        $avgArrivalRaw = EmployeeAttendanceLog::where('staff_profile_id', $profile->id)
            ->where('clock_in_timestamp', '>=', $cutoff)
            ->select(DB::raw("AVG(CAST(strftime('%H', clock_in_timestamp) AS REAL) + CAST(strftime('%H', clock_in_timestamp) AS REAL) / 60.0) as avg_hour"))
            ->first();
        $avgArrival = $avgArrivalRaw?->avg_hour ? round((float) $avgArrivalRaw->avg_hour, 1) : 0;

        return [
            'attendance_dates' => $dailyAttendance,
            'favorite_days' => $favoriteDaysData,
            'monthly_hours' => $monthlyHoursRaw,
            'visit_hour_distribution' => $visitHourDist,
            'weekly_comparison' => [
                'this_week_hours' => round($thisWeekHours, 1),
                'last_week_hours' => round($lastWeekHours, 1),
                'change_hours' => $lastWeekHours > 0 ? round((($thisWeekHours - $lastWeekHours) / $lastWeekHours) * 100, 1) : 0,
                'this_week_days' => $thisWeekDays,
                'last_week_days' => $lastWeekDays,
            ],
            'streak' => [
                'current' => $currentStreak,
                'longest' => $longestStreak,
            ],
            'consistency_score' => $consistencyScore,
            'kpi' => [
                'lifetime_shifts' => $lifetimeShifts,
                'lifetime_hours' => round($lifetimeHours, 1),
                'avg_hours_per_week' => $avgHoursPerWeek,
                'period_total_shifts' => $periodTotalShifts,
                'period_total_hours' => round($periodTotalHours, 1),
                'period_avg_shift_hours' => $periodAvgShiftHours,
                'period_days_worked' => $periodDaysWorked,
                'avg_hours_per_day' => $avgHoursPerDay,
                'avg_arrival_hour' => $avgArrival,
                'tenure_days' => $tenureDays,
            ],
        ];
    }
}
