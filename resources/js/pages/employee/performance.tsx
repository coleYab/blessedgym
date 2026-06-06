import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type StaffEntry = { id: number; name: string; email: string };

type HeatmapEntry = { day: string; hour: string; average_check_ins: number };
type MonthlyTrendEntry = { month: string; current_year: number; previous_year: number };
type StatusEntry = { name: string; value: number };
type RoleEntry = { name: string; value: number };
type DailyActiveEntry = { date: string; active_staff: number };
type WeeklyEntry = { week: string; checkins: number };
type PeakHourEntry = { hour: string; count: number };
type DOWEntry = { day: string; count: number };
type GrowthEntry = { date: string; total_staff: number };
type DurationDistEntry = { range: string; count: number };

type GlobalKPIs = {
    total_staff: number; active_today: number; checkins_today: number;
    unique_staff_today: number; total_checkins_period: number;
    unique_staff_period: number; avg_daily_checkins: number;
    avg_hours_per_shift: number; total_hours_period: number;
};

type GlobalData = {
    heatmap: HeatmapEntry[]; monthly_trend: MonthlyTrendEntry[];
    daily_active: DailyActiveEntry[]; weekly_checkins: WeeklyEntry[];
    peak_hours: PeakHourEntry[]; day_of_week: DOWEntry[];
    staff_growth: GrowthEntry[]; duration_distribution: DurationDistEntry[];
    status_breakdown: StatusEntry[]; role_breakdown: RoleEntry[];
    kpi: GlobalKPIs;
};

type DailyAttendance = { date: string; hours_worked: number };
type FavoriteDay = { day: string; visit_count: number; avg_arrival_hour: number };
type MonthlyHoursEntry = { month: string; total_hours: number; days_worked: number };
type VisitHourEntry = { hour: string; count: number };

type EmployeeKPIs = {
    lifetime_shifts: number; lifetime_hours: number;
    avg_hours_per_week: number; period_total_shifts: number;
    period_total_hours: number; period_avg_shift_hours: number;
    period_days_worked: number; avg_hours_per_day: number;
    avg_arrival_hour: number; tenure_days: number;
};

type EmployeeData = {
    attendance_dates: DailyAttendance[]; favorite_days: FavoriteDay[];
    monthly_hours: MonthlyHoursEntry[]; visit_hour_distribution: VisitHourEntry[];
    weekly_comparison: {
        this_week_hours: number; last_week_hours: number; change_hours: number;
        this_week_days: number; last_week_days: number;
    };
    streak: { current: number; longest: number };
    consistency_score: number;
    kpi: EmployeeKPIs;
};

type SelectedProfile = { id: number; name: string; email: string; role: string | null };

type PageProps = {
    globalData: GlobalData; employeeData: EmployeeData | null;
    selectedProfile: SelectedProfile | null; staff: StaffEntry[]; period: number;
};

const STATUS_COLORS: Record<string, string> = {
    Active: '#10b981', Suspended: '#f59e0b', Terminated: '#e11d48',
};
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 6).padStart(2, '0') + ':00').concat(
    Array.from({ length: 12 }, (_, i) => String(i + 18 > 23 ? i + 18 - 24 : i + 18).padStart(2, '0') + ':00'),
);
const PERIODS = [
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '90', label: '90D' },
    { value: '365', label: '1Y' },
];

export default function EmployeePerformance() {
    const { globalData, employeeData, selectedProfile, staff, period } = usePage<PageProps>().props;

    const [tab, setTab] = useState<'global' | 'single'>(selectedProfile ? 'single' : 'global');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<StaffEntry[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string | number | undefined>) => {
        router.get('/employee/performance', params, { preserveState: true, preserveScroll: true });
    }, []);

    const handleStaffSelect = useCallback((s: StaffEntry) => {
        setShowResults(false);
        setSearchQuery(s.name);
        navigate({ staff_profile_id: s.id, period });
    }, [navigate, period]);

    const handleTabChange = useCallback((t: 'global' | 'single') => {
        setTab(t);
        navigate(t === 'global' ? { period } : {});
    }, [navigate, period]);

    const handlePeriodChange = useCallback((val: string) => {
        const params: Record<string, string | number | undefined> = { period: val };
        if (selectedProfile) params.staff_profile_id = selectedProfile.id;
        navigate(params);
    }, [navigate, selectedProfile]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (searchQuery.length < 1) { setSearchResults([]); setShowResults(false); return; }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/employee/performance/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(await res.json());
                setShowResults(true);
            } catch { setSearchResults([]); }
            finally { setSearching(false); }
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    return (
        <>
            <Head title="Performance Metrics" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading title="Performance Metrics" description="Employee attendance analytics, productivity trends, and individual performance insights." />

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-none border p-1">
                        <button onClick={() => handleTabChange('global')}
                            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${tab === 'global' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            GLOBAL OVERVIEW
                        </button>
                        <button onClick={() => handleTabChange('single')}
                            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${tab === 'single' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            SINGLE EMPLOYEE
                        </button>
                    </div>

                    <div className="flex items-center gap-1 rounded-none border p-1">
                        {PERIODS.map((p) => (
                            <button key={p.value} onClick={() => handlePeriodChange(p.value)}
                                className={`rounded-none px-3 py-1.5 text-xs font-medium transition-colors ${String(period) === p.value ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative" ref={searchRef}>
                    <Label>Select Employee</Label>
                    <div className="relative mt-2">
                        <Input placeholder="Search name or email..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} />
                        {searching && <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />}
                    </div>

                    {showResults && searchResults.length > 0 && (
                        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-none border shadow-md">
                            {searchResults.map((s) => (
                                <button key={s.id} onClick={() => handleStaffSelect(s)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent">
                                    <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
                                        {s.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="font-medium">{s.name}</p>
                                        <p className="text-muted-foreground text-xs">{s.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedProfile && (
                        <div className="mt-3 flex items-center gap-3 rounded-none border bg-muted/50 px-3 py-2">
                            <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
                                {selectedProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{selectedProfile.name}</p>
                                <p className="text-muted-foreground text-xs">{selectedProfile.email}</p>
                            </div>
                            {selectedProfile.role && (
                                <Badge variant="outline">{selectedProfile.role}</Badge>
                            )}
                            <Badge className="ml-auto" variant="outline">Selected</Badge>
                        </div>
                    )}
                </div>

                <Separator />

                {tab === 'global' && <GlobalPerformance data={globalData} />}
                {tab === 'single' && <EmployeePerformanceView data={employeeData} />}
            </div>
        </>
    );
}

// ─── GLOBAL ───────────────────────────────────────────────────

function GlobalPerformance({ data }: { data: GlobalData }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {[
                    { label: 'Total Staff', value: String(data.kpi.total_staff), desc: 'Active profiles' },
                    { label: 'In Now', value: String(data.kpi.active_today), desc: 'Currently clocked in' },
                    { label: "Today's Clock-ins", value: String(data.kpi.checkins_today), desc: 'Total entries' },
                    { label: 'Unique Today', value: String(data.kpi.unique_staff_today), desc: 'Distinct staff' },
                    { label: 'Period Check-ins', value: String(data.kpi.total_checkins_period), desc: 'In selected period' },
                    { label: 'Avg Shift Hours', value: String(data.kpi.avg_hours_per_shift), desc: 'Per completed shift' },
                ].map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] font-medium text-muted-foreground">{k.label}</CardTitle></CardHeader>
                        <CardContent className="p-3 pt-1"><p className="text-xl font-bold">{k.value}</p><p className="text-muted-foreground text-[10px]">{k.desc}</p></CardContent>
                    </Card>
                ))}
            </div>

            <Section title="Daily Active Staff" desc="Unique staff who clocked in per day">
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.daily_active}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                        <YAxis fontSize={12} allowDecimals={false} />
                        <Tooltip labelFormatter={(v: string) => new Date(v).toLocaleDateString()} />
                        <Area type="monotone" dataKey="active_staff" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="Active Staff" />
                    </AreaChart>
                </ResponsiveContainer>
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Weekly Clock-ins" desc="Total clock-ins per week">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.weekly_checkins}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" fontSize={10} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="checkins" fill="#6366f1" radius={[4, 4, 0, 0]} name="Clock-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Day of Week" desc="Total clock-ins by day">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.day_of_week}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" fontSize={11} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Clock-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <Section title="Attendance Heatmap" desc="Clock-in density by hour and day of week (last 90 days)">
                <HeatmapChart data={data.heatmap} />
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Peak Clock-in Hours" desc="Total clock-ins by hour of day">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.peak_hours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" fontSize={9} interval={1} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Clock-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Monthly Trend (YoY)" desc="Unique staff per month">
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data.monthly_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={11} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="current_year" stroke="#6366f1" strokeWidth={2} name="This Year" />
                            <Line type="monotone" dataKey="previous_year" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Last Year" />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Section title="Staff Growth" desc="Cumulative hires over time">
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.staff_growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={9} tickFormatter={(v: string) => v.slice(5)} />
                            <YAxis fontSize={11} />
                            <Tooltip />
                            <Area type="monotone" dataKey="total_staff" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} name="Total" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Employment Status" desc="Current staff distribution">
                    <div className="flex h-[220px] items-center justify-center">
                        {data.status_breakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={data.status_breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                                        paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {data.status_breakdown.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] ?? '#64748b'} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-sm text-muted-foreground">No data</p>}
                    </div>
                </Section>

                <Section title="Role Distribution" desc="Staff by role">
                    <div className="flex h-[220px] items-center justify-center">
                        {data.role_breakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={data.role_breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                                        paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {data.role_breakdown.map((e, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6'][i % 5]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-sm text-muted-foreground">No data</p>}
                    </div>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Shift Duration Distribution" desc="How long staff typically work per shift">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.duration_distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" fontSize={10} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Shifts" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Total Hours Worked" desc="Cumulative hours in selected period">
                    <div className="flex h-[260px] flex-col items-center justify-center gap-2">
                        <p className="text-5xl font-bold tracking-tight text-emerald-600">{data.kpi.total_hours_period}</p>
                        <p className="text-sm text-muted-foreground">hours in selected period</p>
                        <p className="text-xs text-muted-foreground">
                            Avg {data.kpi.avg_hours_per_shift} hrs / shift across {data.kpi.unique_staff_period} staff
                        </p>
                    </div>
                </Section>
            </div>
        </div>
    );
}

// ─── SINGLE EMPLOYEE ──────────────────────────────────────────

function EmployeePerformanceView({ data }: { data: EmployeeData | null }) {
    if (!data) {
        return <Card><CardContent className="flex flex-col items-center gap-2 py-16">
            <p className="text-muted-foreground text-sm">Select an employee above to view their performance metrics.</p>
        </CardContent></Card>;
    }

    const hoursChange = data.kpi.period_total_hours;
    const weekChange = data.weekly_comparison.this_week_hours - data.weekly_comparison.last_week_hours;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Section title="Work Hours" desc="Period vs lifetime metrics">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Hours This Period</p>
                                <p className="mt-0.5 text-3xl font-bold tracking-tight">{data.kpi.period_total_hours}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Avg / Day</p>
                                <p className="mt-0.5 text-3xl font-bold tracking-tight">
                                    {data.kpi.avg_hours_per_day}
                                    <span className="text-base font-normal text-muted-foreground"> hrs</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">This Week</p>
                                <p className="mt-0.5 text-lg font-bold">{data.weekly_comparison.this_week_hours}
                                    <span className={`ml-1.5 text-sm font-medium ${weekChange > 0 ? 'text-emerald-600' : weekChange < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                                        {weekChange === 0 ? '— same' : weekChange > 0 ? `+${weekChange.toFixed(1)}` : weekChange.toFixed(1)} hrs
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Shifts This Period</p>
                                <p className="mt-0.5 text-lg font-bold">{data.kpi.period_total_shifts}</p>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Work Ethic" desc="Consistency and attendance reliability">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Consistency</p>
                                <p className={`mt-0.5 text-3xl font-bold tracking-tight ${
                                    data.consistency_score >= 50 ? 'text-emerald-600' : data.consistency_score >= 20 ? 'text-amber-600' : 'text-rose-600'
                                }`}>{data.consistency_score}%</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                    {data.kpi.period_days_worked} days worked
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Avg Shift</p>
                                <p className="mt-0.5 text-3xl font-bold tracking-tight">{data.kpi.period_avg_shift_hours}<span className="text-base font-normal text-muted-foreground"> hrs</span></p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Avg Hours / Week</p>
                                <p className="mt-0.5 text-lg font-bold">{data.kpi.avg_hours_per_week}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Lifetime Hours</p>
                                <p className="mt-0.5 text-lg font-bold">{data.kpi.lifetime_hours}</p>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Attendance Streaks" desc="Consecutive days worked">
                    <div className="flex h-full flex-col items-center justify-center gap-4 py-6">
                        <div className="text-center">
                            <p className="text-5xl font-bold">{data.streak.current}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Current Streak (days)</p>
                        </div>
                        <div className="h-px w-16 bg-border" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-muted-foreground">{data.streak.longest}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Longest Streak (days)</p>
                        </div>
                        <div className="mt-2 rounded-full bg-muted px-4 py-1.5 text-center">
                            <p className="text-sm font-medium">
                                {data.kpi.lifetime_shifts} lifetime shifts
                            </p>
                        </div>
                    </div>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Weekly Comparison" desc="Hours worked this week vs last week">
                    <div className="flex h-[200px] items-center justify-center gap-8">
                        <div className="text-center">
                            <p className="mb-1 text-xs text-muted-foreground">Last Week</p>
                            <p className="text-3xl font-bold text-muted-foreground">{data.weekly_comparison.last_week_hours}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{data.weekly_comparison.last_week_days} days</p>
                        </div>
                        <div className="text-2xl text-muted-foreground">→</div>
                        <div className="text-center">
                            <p className="mb-1 text-xs text-muted-foreground">This Week</p>
                            <p className="text-3xl font-bold">{data.weekly_comparison.this_week_hours}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{data.weekly_comparison.this_week_days} days</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-xs text-muted-foreground">Change</p>
                            <p className={`text-xl font-bold ${
                                data.weekly_comparison.change_hours > 0 ? 'text-emerald-600' :
                                data.weekly_comparison.change_hours < 0 ? 'text-rose-600' : 'text-muted-foreground'
                            }`}>
                                {data.weekly_comparison.change_hours > 0 ? '+' : ''}{data.weekly_comparison.change_hours}%
                            </p>
                        </div>
                    </div>
                </Section>

                <Section title="Avg Arrival Time" desc="Typical clock-in time">
                    <div className="flex h-[200px] flex-col items-center justify-center">
                        <p className="text-5xl font-bold tracking-tight">
                            {Math.floor(data.kpi.avg_arrival_hour)}:
                            {String(Math.round((data.kpi.avg_arrival_hour % 1) * 60)).padStart(2, '0')}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">Average clock-in time</p>
                    </div>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Monthly Hours Trend" desc="Hours worked per month">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.monthly_hours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={10} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Hours" />
                            <Line type="monotone" dataKey="days_worked" stroke="#10b981" strokeWidth={2} name="Days" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Daily Hours" desc="Hours per day in selected period">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data.attendance_dates}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                            <YAxis fontSize={11} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip labelFormatter={(v: string) => new Date(v).toLocaleDateString()} formatter={(v: number) => [`${v} hrs`, 'Hours']} />
                            <Area type="monotone" dataKey="hours_worked" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} name="Hours" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title="Favorite Days &amp; Arrival Time" desc="Clock-in frequency and avg arrival by day">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.favorite_days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" fontSize={11} />
                            <YAxis yAxisId="left" fontSize={12} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} domain={[0, 24]} tickFormatter={(v) => `${Math.floor(v)}:00`} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="visit_count" fill="#6366f1" name="Visits" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="avg_arrival_hour" stroke="#f59e0b" strokeWidth={2} name="Avg Arrival" dot={{ r: 4 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Clock-in Hour Distribution" desc="When this employee typically clocks in">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.visit_hour_distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" fontSize={9} interval={1} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Clock-ins" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>
        </div>
    );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <Card>
            {(title || desc) && <CardHeader><CardTitle className="text-base">{title}</CardTitle>
                {desc && <CardDescription>{desc}</CardDescription>}</CardHeader>}
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function HeatmapChart({ data }: { data: HeatmapEntry[] }) {
    const maxVal = Math.max(...data.map((h) => h.average_check_ins), 1);
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                <div className="mb-2 flex" style={{ paddingLeft: 60 }}>
                    {HOURS.map((h) => <div key={h} className="text-muted-foreground flex-1 text-center text-[10px]">{h}</div>)}
                </div>
                {DAYS.map((day) => (
                    <div key={day} className="mb-0.5 flex items-center">
                        <div className="w-[60px] shrink-0 pr-2 text-right text-xs font-medium text-muted-foreground">{day.slice(0, 3)}</div>
                        {HOURS.map((hour) => {
                            const entry = data.find((h) => h.day === day && h.hour === hour);
                            const val = entry?.average_check_ins ?? 0;
                            const intensity = maxVal > 0 ? Math.min(val / maxVal, 1) : 0;
                            return <div key={`${day}-${hour}`} className="flex-1" title={`${day} ${hour}: ${val}`}>
                                <div className="mx-[1px] h-5 rounded-none" style={{
                                    backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${0.1 + intensity * 0.8})` : 'hsl(var(--muted))',
                                }} />
                            </div>;
                        })}
                    </div>
                ))}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Low</span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => <div key={i} className="size-3 rounded-none" style={{ backgroundColor: `rgba(16, 185, 129, ${i})` }} />)}
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}

EmployeePerformance.layout = {
    breadcrumbs: [
        { title: 'Performance Metrics', href: '/employee/performance' },
    ],
};
