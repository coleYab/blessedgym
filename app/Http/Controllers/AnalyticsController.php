<?php

namespace App\Http\Controllers;

use App\Models\CheckinLog;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $memberId = $request->input('member_id');
        $period = (int) ($request->input('period', 30));
        $member = null;
        $globalData = [];
        $memberData = null;

        if ($memberId) {
            $member = Member::with('currentPlan')->find($memberId);
            if ($member) {
                $memberData = $this->getMemberAnalytics($member, $period);
            }
        }

        if (! $memberId) {
            $globalData = $this->getGlobalAnalytics($period);
        }

        $members = Member::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('membership/analytics', [
            'globalData' => $globalData,
            'memberData' => $memberData,
            'selectedMember' => $member ? [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
            ] : null,
            'members' => $members,
            'period' => $period,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q');
        if (! $query || strlen($query) < 1) {
            return response()->json([]);
        }

        $members = Member::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
                ->orWhere('last_name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%");
        })->limit(20)->get(['id', 'first_name', 'last_name', 'email']);

        return response()->json($members);
    }

    private function getGlobalAnalytics(int $period): array
    {
        $cutoff = now()->subDays($period);
        $heatmapCutoff = now()->subDays(90);

        $heatmapRaw = CheckinLog::where('check_in_timestamp', '>=', $heatmapCutoff)
            ->select(
                DB::raw("strftime('%w', check_in_timestamp) as day_of_week"),
                DB::raw("strftime('%H', check_in_timestamp) as hour"),
                DB::raw('COUNT(*) as check_ins'),
            )
            ->groupBy(DB::raw("strftime('%w', check_in_timestamp)"), DB::raw("strftime('%H', check_in_timestamp)"))
            ->get();

        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $heatmapData = collect(range(0, 6))->flatMap(fn ($day) => collect(range(0, 23))->map(function ($hour) use ($heatmapRaw, $day, $dayNames) {
            $row = $heatmapRaw->firstWhere(fn ($r) => (int) $r->day_of_week === $day && (int) $r->hour === $hour);

            return [
                'day' => $dayNames[$day],
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'average_check_ins' => $row ? (int) $row->check_ins : 0,
            ];
        }))->values()->toArray();

        $twoYearsBack = now()->subYears(2);
        $monthlyRaw = CheckinLog::where('check_in_timestamp', '>=', $twoYearsBack)
            ->select(
                DB::raw("strftime('%m', check_in_timestamp) as month"),
                DB::raw("strftime('%Y', check_in_timestamp) as year"),
                DB::raw('COUNT(DISTINCT member_id) as unique_visits'),
            )
            ->groupBy(DB::raw("strftime('%Y', check_in_timestamp)"), DB::raw("strftime('%m', check_in_timestamp)"))
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
                'current_year' => $current ? (int) $current->unique_visits : 0,
                'previous_year' => $previous ? (int) $previous->unique_visits : 0,
            ];
        }, array_keys($monthLabels));

        // method distribution for period
        $methodRaw = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw('date(check_in_timestamp) as date'), 'check_in_method', DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('date(check_in_timestamp)'), 'check_in_method')
            ->orderBy('date')->get();

        $methodDates = collect();
        for ($i = $period; $i >= 0; $i--) {
            $methodDates->push(now()->subDays($i)->format('Y-m-d'));
        }

        $methodDistribution = $methodDates->map(function ($date) use ($methodRaw) {
            $row = $methodRaw->where('date', $date);

            return [
                'date' => $date,
                'QR_Code' => (int) ($row->firstWhere('check_in_method', 'QR_Code')?->count ?? 0),
                'Bar_Code' => (int) ($row->firstWhere('check_in_method', 'Bar_Code')?->count ?? 0),
                'Manual_Admin' => (int) ($row->firstWhere('check_in_method', 'Manual_Admin')?->count ?? 0),
                'RFID' => (int) ($row->firstWhere('check_in_method', 'RFID')?->count ?? 0),
            ];
        })->values()->toArray();

        // method pie (aggregated)
        $methodPie = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select('check_in_method', DB::raw('COUNT(*) as count'))
            ->groupBy('check_in_method')
            ->get()
            ->map(fn ($r) => ['name' => $r->check_in_method, 'value' => (int) $r->count])
            ->values()->toArray();

        $statusBreakdown = Member::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->get()
            ->map(fn ($r) => ['name' => $r->status, 'value' => (int) $r->count])
            ->values()->toArray();

        // daily active members
        $dailyActive = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw('date(check_in_timestamp) as date'), DB::raw('COUNT(DISTINCT member_id) as active_count'))
            ->groupBy(DB::raw('date(check_in_timestamp)'))
            ->orderBy('date')->get();

        $dailyActiveData = $methodDates->map(function ($date) use ($dailyActive) {
            $row = $dailyActive->firstWhere('date', $date);

            return ['date' => $date, 'active_members' => $row ? (int) $row->active_count : 0];
        })->values()->toArray();

        // weekly check-ins
        $weeklyRaw = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw("strftime('%Y-%W', check_in_timestamp) as week"), DB::raw('COUNT(*) as checkins'))
            ->groupBy(DB::raw("strftime('%Y-%W', check_in_timestamp)"))
            ->orderBy('week')->get();

        $weeklyData = $weeklyRaw->map(fn ($r) => [
            'week' => $r->week,
            'checkins' => (int) $r->checkins,
        ])->values()->toArray();

        // peak hours (aggregate)
        $peakHoursRaw = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw("strftime('%H', check_in_timestamp) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw("strftime('%H', check_in_timestamp)"))
            ->orderBy('hour')->get();

        $peakHours = collect(range(0, 23))->map(function ($hour) use ($peakHoursRaw) {
            $row = $peakHoursRaw->firstWhere(fn ($r) => (int) $r->hour === $hour);

            return [
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'count' => $row ? (int) $row->count : 0,
            ];
        })->values()->toArray();

        // day of week totals
        $dowRaw = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw("strftime('%w', check_in_timestamp) as day"), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw("strftime('%w', check_in_timestamp)"))
            ->get();

        $dowData = collect(range(0, 6))->map(function ($day) use ($dowRaw, $dayNames) {
            $row = $dowRaw->firstWhere(fn ($r) => (int) $r->day === $day);

            return [
                'day' => $dayNames[$day],
                'count' => $row ? (int) $row->count : 0,
            ];
        })->values()->toArray();

        // member growth (cumulative)
        $growthRaw = Member::select(DB::raw('date(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('date(created_at)'))
            ->orderBy('date')->get();

        $cumulative = 0;
        $growthData = $growthRaw->map(function ($r) use (&$cumulative) {
            $cumulative += (int) $r->count;

            return ['date' => $r->date, 'total_members' => $cumulative];
        })->values()->toArray();

        // session duration distribution
        $durationBuckets = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->whereNotNull('check_out_timestamp')
            ->select(DB::raw('CAST((julianday(check_out_timestamp) - julianday(check_in_timestamp)) * 1440 AS INTEGER) as minutes'))
            ->get()
            ->groupBy(fn ($r) => match (true) {
                $r->minutes < 15 => '0-15',
                $r->minutes < 30 => '15-30',
                $r->minutes < 45 => '30-45',
                $r->minutes < 60 => '45-60',
                $r->minutes < 90 => '60-90',
                default => '90+',
            });

        $durationLabels = ['0-15', '15-30', '30-45', '45-60', '60-90', '90+'];
        $durationData = collect($durationLabels)->map(fn ($label) => [
            'range' => $label,
            'count' => $durationBuckets->get($label)?->count() ?? 0,
        ])->values()->toArray();

        // new vs returning (first-time checkin in period)
        $firstCheckinDates = CheckinLog::select('member_id', DB::raw('MIN(date(check_in_timestamp)) as first_date'))
            ->groupBy('member_id')->get()->keyBy('member_id');

        $newReturningRaw = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw('date(check_in_timestamp) as date'), 'member_id')
            ->get()
            ->groupBy('date');

        $newReturningData = $methodDates->map(function ($date) use ($newReturningRaw, $firstCheckinDates) {
            $dayLogs = $newReturningRaw->get($date, collect());
            $newCount = $dayLogs->filter(fn ($l) => ($firstCheckinDates[$l->member_id] ?? null)?->first_date === $date)->count();
            $returningCount = $dayLogs->count() - $newCount;

            return [
                'date' => $date,
                'new' => $newCount,
                'returning' => max(0, $returningCount),
            ];
        })->values()->toArray();

        // retention rate (weekly: % of members who were active last week and still active this week)
        $weeklyMembers = CheckinLog::where('check_in_timestamp', '>=', now()->subDays(60))
            ->select(DB::raw("strftime('%Y-%W', check_in_timestamp) as week"), 'member_id')
            ->distinct()
            ->get()
            ->groupBy('week');

        $retentionKeys = $weeklyMembers->keys()->sort()->values();
        $retentionData = [];
        for ($i = 1; $i < $retentionKeys->count(); $i++) {
            $prevWeek = $retentionKeys[$i - 1];
            $currWeek = $retentionKeys[$i];
            $prevMembers = $weeklyMembers->get($prevWeek, collect())->pluck('member_id');
            $currMembers = $weeklyMembers->get($currWeek, collect())->pluck('member_id');
            $retained = $prevMembers->intersect($currMembers)->count();
            $rate = $prevMembers->count() > 0 ? round(($retained / $prevMembers->count()) * 100, 1) : 0;
            $retentionData[] = ['week' => $currWeek, 'rate' => $rate];
        }

        // kpi cards
        $totalMembers = Member::count();
        $activeToday = CheckinLog::whereDate('check_in_timestamp', today())
            ->distinct('member_id')->count('member_id');
        $checkinsToday = CheckinLog::whereDate('check_in_timestamp', today())->count();
        $totalCheckinsPeriod = CheckinLog::where('check_in_timestamp', '>=', $cutoff)->count();
        $uniqueMembersPeriod = CheckinLog::where('check_in_timestamp', '>=', $cutoff)
            ->distinct('member_id')->count('member_id');
        $avgDaily = $period > 0 ? round($totalCheckinsPeriod / $period, 1) : 0;

        return [
            'heatmap' => $heatmapData,
            'monthly_trend' => $monthlyTrend,
            'method_distribution' => $methodDistribution,
            'method_pie' => $methodPie,
            'status_breakdown' => $statusBreakdown,
            'daily_active' => $dailyActiveData,
            'weekly_checkins' => $weeklyData,
            'peak_hours' => $peakHours,
            'day_of_week' => $dowData,
            'member_growth' => $growthData,
            'duration_distribution' => $durationData,
            'new_vs_returning' => $newReturningData,
            'retention_rate' => $retentionData,
            'kpi' => [
                'total_members' => $totalMembers,
                'active_today' => $activeToday,
                'checkins_today' => $checkinsToday,
                'total_checkins_period' => $totalCheckinsPeriod,
                'unique_members_period' => $uniqueMembersPeriod,
                'avg_daily_checkins' => $avgDaily,
            ],
        ];
    }

    private function getMemberAnalytics(Member $member, int $period): array
    {
        $cutoff = now()->subDays($period);
        $oneYearBack = now()->subYear();

        $attendanceDates = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $oneYearBack)
            ->whereNotNull('check_out_timestamp')
            ->select(
                DB::raw('date(check_in_timestamp) as date'),
                DB::raw('CAST((julianday(check_out_timestamp) - julianday(check_in_timestamp)) * 1440 AS INTEGER) as session_duration_minutes'),
            )
            ->orderBy('date')->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'session_duration_minutes' => max(0, (int) $r->session_duration_minutes),
            ])->values()->toArray();

        $favoriteDays = CheckinLog::where('member_id', $member->id)
            ->select(
                DB::raw("strftime('%w', check_in_timestamp) as day_of_week"),
                DB::raw('COUNT(*) as visit_count'),
                DB::raw("CAST(AVG(CAST(strftime('%H', check_in_timestamp) AS REAL) + CAST(strftime('%M', check_in_timestamp) AS REAL) / 60.0) AS REAL) as avg_arrival_hour"),
            )
            ->groupBy(DB::raw("strftime('%w', check_in_timestamp)"))->get();

        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $favoriteDaysData = collect(range(0, 6))->map(function ($day) use ($favoriteDays, $dayNames) {
            $row = $favoriteDays->firstWhere(fn ($r) => (int) $r->day_of_week === $day);

            return [
                'day' => $dayNames[$day],
                'visit_count' => $row ? (int) $row->visit_count : 0,
                'avg_arrival_hour' => $row ? round((float) $row->avg_arrival_hour, 1) : 0,
            ];
        })->values()->toArray();

        $durationTrend = CheckinLog::where('member_id', $member->id)
            ->whereNotNull('check_out_timestamp')->where('check_in_timestamp', '>=', $oneYearBack)
            ->select(
                DB::raw('date(check_in_timestamp) as date'),
                DB::raw('CAST((julianday(check_out_timestamp) - julianday(check_in_timestamp)) * 1440 AS INTEGER) as duration_minutes'),
            )
            ->orderBy('check_in_timestamp')->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'duration_minutes' => max(0, (int) $r->duration_minutes),
            ])->values()->toArray();

        // --- NEW: visit hour distribution ---
        $visitHoursRaw = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $cutoff)
            ->select(DB::raw("strftime('%H', check_in_timestamp) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw("strftime('%H', check_in_timestamp)"))
            ->orderBy('hour')->get();

        $visitHourDist = collect(range(0, 23))->map(function ($hour) use ($visitHoursRaw) {
            $row = $visitHoursRaw->firstWhere(fn ($r) => (int) $r->hour === $hour);

            return [
                'hour' => str_pad($hour, 2, '0', STR_PAD_LEFT).':00',
                'count' => $row ? (int) $row->count : 0,
            ];
        })->values()->toArray();

        // --- NEW: weekly comparison (this week vs last week) ---
        $thisWeekStart = now()->startOfWeek();
        $lastWeekStart = (clone $thisWeekStart)->subWeek();
        $thisWeekCount = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $thisWeekStart)->count();
        $lastWeekCount = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $lastWeekStart)
            ->where('check_in_timestamp', '<', $thisWeekStart)->count();

        // --- NEW: monthly active days ---
        $monthlyActiveRaw = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $oneYearBack)
            ->select(DB::raw("strftime('%Y-%m', check_in_timestamp) as month"), DB::raw('COUNT(DISTINCT date(check_in_timestamp)) as active_days'))
            ->groupBy(DB::raw("strftime('%Y-%m', check_in_timestamp)"))
            ->orderBy('month')->get();

        $monthlyActiveData = $monthlyActiveRaw->map(fn ($r) => [
            'month' => $r->month,
            'active_days' => (int) $r->active_days,
        ])->values()->toArray();

        // --- NEW: streak ---
        $streakDates = CheckinLog::where('member_id', $member->id)
            ->select(DB::raw('date(check_in_timestamp) as date'))
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

        // --- NEW: consistency score ---
        $daysInPeriod = max(1, $period);
        $daysVisitedInPeriod = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', $cutoff)
            ->distinct()->count(DB::raw('date(check_in_timestamp)'));
        $consistencyScore = min(100, round(($daysVisitedInPeriod / $daysInPeriod) * 100));

        // --- KPIs ---
        $visitsLast30Days = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', now()->subDays(30))->count();

        $lifetimeVisits = CheckinLog::where('member_id', $member->id)->count();
        $firstCheckin = CheckinLog::where('member_id', $member->id)->min('check_in_timestamp');
        $lifetimeDays = max(1, now()->diffInDays($firstCheckin ?? now()));
        $avgFrequencyPerWeek = round(($lifetimeVisits / $lifetimeDays) * 7, 1);

        $visitsLast14Days = CheckinLog::where('member_id', $member->id)
            ->where('check_in_timestamp', '>=', now()->subDays(14))->count();
        $expected14Day = ($avgFrequencyPerWeek / 7) * 14;
        $churnScore = $expected14Day > 0 ? ($visitsLast14Days / $expected14Day) : 1;
        $churnRisk = match (true) {
            $churnScore < 0.3 => 'High',
            $churnScore < 0.7 => 'Medium',
            default => 'Low',
        };

        $lastCheckin = CheckinLog::where('member_id', $member->id)
            ->orderByDesc('check_in_timestamp')->first();
        $lastVisitDaysAgo = $lastCheckin ? (int) $lastCheckin->check_in_timestamp->diffInDays(now()) : null;

        $peakHourRaw = CheckinLog::where('member_id', $member->id)
            ->select(DB::raw("strftime('%H', check_in_timestamp) as hour"), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw("strftime('%H', check_in_timestamp)"))->orderByDesc('count')->first();

        $peakPeriod = match (true) {
            ! $peakHourRaw => 'Unknown',
            (int) $peakHourRaw->hour < 12 => 'Morning (6 AM - 12 PM)',
            (int) $peakHourRaw->hour < 17 => 'Afternoon (12 PM - 5 PM)',
            default => 'Late Afternoon (4 PM - 6 PM)',
        };

        $utilizationRate = min(100, round(($visitsLast30Days / 12) * 100));

        return [
            'attendance_dates' => $attendanceDates,
            'favorite_days' => $favoriteDaysData,
            'duration_trend' => $durationTrend,
            'visit_hour_distribution' => $visitHourDist,
            'weekly_comparison' => [
                'this_week' => $thisWeekCount,
                'last_week' => $lastWeekCount,
                'change' => $lastWeekCount > 0 ? round((($thisWeekCount - $lastWeekCount) / $lastWeekCount) * 100, 1) : 0,
            ],
            'monthly_active_days' => $monthlyActiveData,
            'streak' => [
                'current' => $currentStreak,
                'longest' => $longestStreak,
            ],
            'consistency_score' => $consistencyScore,
            'utilization_rate' => $utilizationRate,
            'kpi' => [
                'avg_frequency_per_week' => $avgFrequencyPerWeek,
                'churn_risk' => $churnRisk,
                'churn_score' => round($churnScore, 2),
                'last_visit_days_ago' => $lastVisitDaysAgo,
                'peak_velocity_period' => $peakPeriod,
                'visits_last_30_days' => $visitsLast30Days,
                'consistency_score' => $consistencyScore,
                'current_streak' => $currentStreak,
                'longest_streak' => $longestStreak,
                'this_week_visits' => $thisWeekCount,
                'last_week_visits' => $lastWeekCount,
            ],
        ];
    }
}
