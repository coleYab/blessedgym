<?php

namespace App\Http\Controllers;

use App\Models\CheckinLog;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $memberId = $request->input('member_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $search = $request->input('search');

        $members = Member::orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'email']);

        $member = null;
        $logs = collect();
        $summary = null;

        if ($memberId) {
            $member = Member::find($memberId);

            if ($member) {
                $query = CheckinLog::where('member_id', $member->id);

                if ($dateFrom) {
                    $query->whereDate('check_in_timestamp', '>=', $dateFrom);
                }

                if ($dateTo) {
                    $query->whereDate('check_in_timestamp', '<=', $dateTo);
                }

                $logs = $query->orderByDesc('check_in_timestamp')
                    ->paginate(15)
                    ->through(fn (CheckinLog $log) => [
                        'id' => $log->id,
                        'member_id' => $log->member_id,
                        'check_in_timestamp' => $log->check_in_timestamp->format('Y-m-d H:i:s'),
                        'check_out_timestamp' => $log->check_out_timestamp?->format('Y-m-d H:i:s'),
                        'check_in_method' => $log->check_in_method,
                        'duration_minutes' => $log->check_out_timestamp
                            ? max(0, (int) $log->check_in_timestamp->diffInMinutes($log->check_out_timestamp))
                            : null,
                        'status' => $log->check_out_timestamp ? 'Completed' : 'Active',
                        'date' => $log->check_in_timestamp->format('Y-m-d'),
                        'check_in_time' => $log->check_in_timestamp->format('H:i:s'),
                        'check_out_time' => $log->check_out_timestamp?->format('H:i:s'),
                    ]);

                $summary = $this->getMemberSummary($member, $dateFrom, $dateTo);
            }
        }

        return Inertia::render('membership/attendance', [
            'logs' => $logs,
            'member' => $member ? [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
            ] : null,
            'members' => $members,
            'summary' => $summary,
            'filters' => [
                'member_id' => $memberId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $search,
            ],
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

    private function getMemberSummary(Member $member, ?string $dateFrom, ?string $dateTo): array
    {
        $query = CheckinLog::where('member_id', $member->id);

        if ($dateFrom) {
            $query->whereDate('check_in_timestamp', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('check_in_timestamp', '<=', $dateTo);
        }

        $totalVisits = (clone $query)->count();
        $completedVisits = (clone $query)->whereNotNull('check_out_timestamp')->count();

        $avgDuration = (clone $query)->whereNotNull('check_out_timestamp')
            ->get()
            ->avg(fn ($log) => $log->check_in_timestamp->diffInMinutes($log->check_out_timestamp));

        $uniqueDays = (clone $query)
            ->distinct()
            ->count(DB::raw('date(check_in_timestamp)'));

        $mostFrequentMethod = (clone $query)
            ->select('check_in_method', DB::raw('COUNT(*) as count'))
            ->groupBy('check_in_method')
            ->orderByDesc('count')
            ->first();

        $currentStreak = 0;
        $streakDates = CheckinLog::where('member_id', $member->id)
            ->select(DB::raw('date(check_in_timestamp) as date'))
            ->distinct()->orderByDesc('date')->get()->pluck('date');

        $checkDate = today();
        foreach ($streakDates as $date) {
            if ($date === $checkDate->format('Y-m-d')) {
                $currentStreak++;
                $checkDate->subDay();
            } else {
                break;
            }
        }

        return [
            'total_visits' => $totalVisits,
            'completed_visits' => $completedVisits,
            'avg_duration_minutes' => $avgDuration ? round($avgDuration, 1) : 0,
            'unique_days' => $uniqueDays,
            'most_frequent_method' => $mostFrequentMethod?->check_in_method ?? 'N/A',
            'current_streak' => $currentStreak,
        ];
    }
}
