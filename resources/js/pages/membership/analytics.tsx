import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Member = { id: number; first_name: string; last_name: string; email: string };

type HeatmapEntry = { day: string; hour: string; average_check_ins: number };
type MonthlyTrendEntry = { month: string; current_year: number; previous_year: number };
type MethodEntry = { date: string; QR_Code: number; Bar_Code: number; Manual_Admin: number; RFID: number };
type StatusEntry = { name: string; value: number };
type DailyActiveEntry = { date: string; active_members: number };
type WeeklyEntry = { week: string; checkins: number };
type PeakHourEntry = { hour: string; count: number };
type DOWEntry = { day: string; count: number };
type GrowthEntry = { date: string; total_members: number };
type DurationDistEntry = { range: string; count: number };
type NewReturningEntry = { date: string; new: number; returning: number };
type RetentionEntry = { week: string; rate: number };
type MethodPieEntry = { name: string; value: number };

type GlobalKPIs = {
    total_members: number; active_today: number; checkins_today: number;
    total_checkins_period: number; unique_members_period: number; avg_daily_checkins: number;
};

type GlobalData = {
    heatmap: HeatmapEntry[]; monthly_trend: MonthlyTrendEntry[];
    method_distribution: MethodEntry[]; method_pie: MethodPieEntry[];
    status_breakdown: StatusEntry[]; daily_active: DailyActiveEntry[];
    weekly_checkins: WeeklyEntry[]; peak_hours: PeakHourEntry[];
    day_of_week: DOWEntry[]; member_growth: GrowthEntry[];
    duration_distribution: DurationDistEntry[]; new_vs_returning: NewReturningEntry[];
    retention_rate: RetentionEntry[]; kpi: GlobalKPIs;
};

type AttendanceDate = { date: string; session_duration_minutes: number };
type FavoriteDay = { day: string; visit_count: number; avg_arrival_hour: number };
type DurationEntry = { date: string; duration_minutes: number };
type VisitHourEntry = { hour: string; count: number };
type MonthlyActiveEntry = { month: string; active_days: number };

type MemberKPIs = {
    avg_frequency_per_week: number; churn_risk: string; churn_score: number;
    last_visit_days_ago: number | null; peak_velocity_period: string;
    visits_last_30_days: number; consistency_score: number;
    current_streak: number; longest_streak: number;
    this_week_visits: number; last_week_visits: number;
};

type MemberData = {
    attendance_dates: AttendanceDate[]; favorite_days: FavoriteDay[];
    duration_trend: DurationEntry[]; visit_hour_distribution: VisitHourEntry[];
    weekly_comparison: { this_week: number; last_week: number; change: number };
    monthly_active_days: MonthlyActiveEntry[];
    streak: { current: number; longest: number };
    consistency_score: number; utilization_rate: number;
    kpi: MemberKPIs;
};

type PageProps = {
    globalData: GlobalData; memberData: MemberData | null;
    selectedMember: Member | null; members: Member[]; period: number;
};

const STATUS_COLORS: Record<string, string> = {
    Active: '#10b981', Frozen: '#06b6d4', Cancelled: '#e11d48', Expired: '#64748b',
};
const METHOD_COLORS: Record<string, string> = {
    QR_Code: '#6366f1', Bar_Code: '#f59e0b', Manual_Admin: '#ef4444', RFID: '#10b981',
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

export default function Analytics() {
    const { t } = useTranslation();
    const { globalData, memberData, selectedMember, members, period } = usePage<PageProps>().props;

    const [tab, setTab] = useState<'global' | 'single'>(selectedMember ? 'single' : 'global');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string | number | undefined>) => {
        router.get('/membership/analytics', params, { preserveState: true, preserveScroll: true });
    }, []);

    const handleMemberSelect = useCallback((m: Member) => {
        setShowResults(false);
        setSearchQuery(`${m.first_name} ${m.last_name}`);
        navigate({ member_id: m.id, period });
    }, [navigate, period]);

    const handleTabChange = useCallback((t: 'global' | 'single') => {
        setTab(t);
        navigate(t === 'global' ? { period } : {});
    }, [navigate, period]);

    const handlePeriodChange = useCallback((val: string) => {
        const params: Record<string, string | number | undefined> = { period: val };

        if (selectedMember) {
params.member_id = selectedMember.id;
}

        navigate(params);
    }, [navigate, selectedMember]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
setShowResults(false);
}
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) {
clearTimeout(debounceRef.current);
}

        if (searchQuery.length < 1) {
 setSearchResults([]); setShowResults(false);

 return; 
}

        debounceRef.current = setTimeout(async () => {
            setSearching(true);

            try {
                const res = await fetch(`/membership/analytics/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(await res.json());
                setShowResults(true);
            } catch {
 setSearchResults([]); 
} finally {
 setSearching(false); 
}
        }, 300);

        return () => {
 if (debounceRef.current) {
clearTimeout(debounceRef.current);
} 
};
    }, [searchQuery]);

    return (
        <>
            <Head title={t('membership.analytics.title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading title={t('membership.analytics.title')} description={t('membership.analytics.description')} />

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-none border p-1">
                        <button onClick={() => handleTabChange('global')}
                            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${tab === 'global' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            {t('membership.analytics.global_overview')}
                        </button>
                        <button onClick={() => handleTabChange('single')}
                            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${tab === 'single' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            {t('membership.analytics.single_member')}
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
                    <Label>{t('membership.analytics.select_member')}</Label>
                    <div className="relative mt-2">
                        <Input placeholder={t('membership.analytics.search_placeholder')} value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} />
                        {searching && <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />}
                    </div>

                    {showResults && searchResults.length > 0 && (
                        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-none border shadow-md">
                            {searchResults.map((m) => (
                                <button key={m.id} onClick={() => handleMemberSelect(m)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent">
                                    <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
                                        {m.first_name[0]}{m.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">{m.first_name} {m.last_name}</p>
                                        <p className="text-muted-foreground text-xs">{m.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedMember && (
                        <div className="mt-3 flex items-center gap-3 rounded-none border bg-muted/50 px-3 py-2">
                            <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-medium">
                                {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{selectedMember.first_name} {selectedMember.last_name}</p>
                                <p className="text-muted-foreground text-xs">{selectedMember.email}</p>
                            </div>
                            <Badge className="ml-auto" variant="outline">{t('membership.analytics.selected')}</Badge>
                        </div>
                    )}
                </div>

                <Separator />

                {tab === 'global' && <GlobalAnalytics data={globalData} />}
                {tab === 'single' && <MemberAnalytics data={memberData} />}
            </div>
        </>
    );
}

// ─── GLOBAL ───────────────────────────────────────────────────

function GlobalAnalytics({ data }: { data: GlobalData }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                    { label: t('membership.analytics.total_members'), value: String(data.kpi.total_members), desc: t('membership.analytics.registered') },
                    { label: t('membership.analytics.active_today'), value: String(data.kpi.active_today), desc: t('membership.analytics.checked_in') },
                    { label: t('membership.analytics.todays_checkins'), value: String(data.kpi.checkins_today), desc: t('membership.analytics.total_entries') },
                    { label: t('membership.analytics.period_checkins'), value: String(data.kpi.total_checkins_period), desc: t('membership.analytics.in_selected_period') },
                    { label: t('membership.analytics.unique_members'), value: String(data.kpi.unique_members_period), desc: t('membership.analytics.in_selected_period') },
                    { label: t('membership.analytics.avg_daily'), value: String(data.kpi.avg_daily_checkins), desc: t('membership.analytics.checkins_per_day') },
                ].map((k) => (
                    <Card key={k.label}>
                        <CardHeader className="p-3 pb-0"><CardTitle className="text-[10px] font-medium text-muted-foreground">{k.label}</CardTitle></CardHeader>
                        <CardContent className="p-3 pt-1"><p className="text-xl font-bold">{k.value}</p><p className="text-muted-foreground text-[10px]">{k.desc}</p></CardContent>
                    </Card>
                ))}
            </div>

            <Section title={t('membership.analytics.daily_activity')} desc={t('membership.analytics.daily_activity_desc')}>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.daily_active}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                        <YAxis fontSize={12} allowDecimals={false} />
                        <Tooltip labelFormatter={(v: string) => new Date(v).toLocaleDateString()} />
                        <Area type="monotone" dataKey="active_members" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name={t('membership.analytics.chart_active_members')} />
                    </AreaChart>
                </ResponsiveContainer>
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.weekly_checkins')} desc={t('membership.analytics.weekly_checkins_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.weekly_checkins}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" fontSize={10} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="checkins" fill="#6366f1" radius={[4, 4, 0, 0]} name={t('membership.analytics.chart_checkins')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.day_of_week')} desc={t('membership.analytics.day_of_week_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.day_of_week}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" fontSize={11} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name={t('membership.analytics.chart_checkins')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <Section title={t('membership.analytics.heatmap')} desc={t('membership.analytics.heatmap_desc')}>
                <HeatmapChart data={data.heatmap} />
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.peak_hours')} desc={t('membership.analytics.peak_hours_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.peak_hours}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" fontSize={9} interval={1} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} name={t('membership.analytics.chart_checkins')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.monthly_trend')} desc={t('membership.analytics.monthly_trend_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data.monthly_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={11} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="current_year" stroke="#6366f1" strokeWidth={2} name={t('membership.analytics.chart_this_year')} />
                            <Line type="monotone" dataKey="previous_year" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name={t('membership.analytics.chart_last_year')} />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.checkin_methods')} desc={t('membership.analytics.checkin_methods_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.method_distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            {Object.keys(METHOD_COLORS).map((m) => (
                                <Bar key={m} dataKey={m} stackId="a" fill={METHOD_COLORS[m]} name={t('membership.analytics.' + m.toLowerCase())} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.method_share')} desc={t('membership.analytics.method_share_desc')}>
                    <div className="flex h-[260px] items-center justify-center">
                        {data.method_pie.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={data.method_pie} cx="50%" cy="50%" outerRadius={90} paddingAngle={3}
                                        dataKey="value" label={({ name: methodName, percent }) => `${t('membership.analytics.' + methodName.toLowerCase())} ${(percent * 100).toFixed(0)}%`}>
                                        {data.method_pie.map((e, i) => <Cell key={i} fill={METHOD_COLORS[e.name] ?? '#64748b'} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-sm text-muted-foreground">{t('membership.analytics.no_data')}</p>}
                    </div>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Section title={t('membership.analytics.member_growth')} desc={t('membership.analytics.member_growth_desc')}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.member_growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={9} tickFormatter={(v: string) => v.slice(5)} />
                            <YAxis fontSize={11} />
                            <Tooltip />
                            <Area type="monotone" dataKey="total_members" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} name={t('membership.analytics.chart_total')} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.status_breakdown')} desc={t('membership.analytics.status_breakdown_desc')}>
                    <div className="flex h-[220px] items-center justify-center">
                        {data.status_breakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={data.status_breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                                        paddingAngle={3} dataKey="value" label={({ name: statusName, percent }) => `${t('membership.analytics.' + statusName.toLowerCase())} ${(percent * 100).toFixed(0)}%`}>
                                        {data.status_breakdown.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] ?? '#64748b'} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            ) : <p className="text-sm text-muted-foreground">{t('membership.analytics.no_data')}</p>}
                            </div>
                        </Section>

                        <Section title={t('membership.analytics.session_duration')} desc={t('membership.analytics.session_duration_desc')}>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.duration_distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" fontSize={10} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={t('membership.analytics.chart_sessions')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.new_vs_returning')} desc={t('membership.analytics.new_vs_returning_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.new_vs_returning}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="new" stackId="a" fill="#10b981" name={t('membership.analytics.chart_new')} />
                            <Bar dataKey="returning" stackId="a" fill="#6366f1" name={t('membership.analytics.chart_returning')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.weekly_retention')} desc={t('membership.analytics.weekly_retention_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data.retention_rate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" fontSize={10} />
                            <YAxis fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                            <Tooltip formatter={(v: number) => [`${v}%`, t('membership.analytics.chart_retention_rate')]} />
                            <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={false} name={t('membership.analytics.chart_retention_rate')} />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>
            </div>
        </div>
    );
}

// ─── SINGLE MEMBER ────────────────────────────────────────────

function MemberAnalytics({ data }: { data: MemberData | null }) {
    const { t } = useTranslation();
    if (!data) {
        return <Card><CardContent className="flex flex-col items-center gap-2 py-16">
            <p className="text-muted-foreground text-sm">{t('membership.analytics.select_prompt')}</p>
        </CardContent></Card>;
    }

    const weekChange = data.kpi.this_week_visits - data.kpi.last_week_visits;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Section title={t('membership.analytics.visit_activity')} desc={t('membership.analytics.visit_activity_desc')}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.d30_visits')}</p>
                                <p className="mt-0.5 text-3xl font-bold tracking-tight">{data.kpi.visits_last_30_days}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.avg_frequency')}</p>
                                <p className="mt-0.5 text-3xl font-bold tracking-tight">{data.kpi.avg_frequency_per_week}<span className="text-base font-normal text-muted-foreground">{t('membership.analytics.per_week')}</span></p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.this_week')}</p>
                                <p className="mt-0.5 text-lg font-bold">{data.kpi.this_week_visits}
                                    <span className={`ml-1.5 text-sm font-medium ${weekChange > 0 ? 'text-emerald-600' : weekChange < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                                        {weekChange === 0 ? t('membership.analytics.same') : weekChange > 0 ? `+${weekChange}` : weekChange}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.last_visit')}</p>
                                <p className="mt-0.5 text-lg font-bold">
                                    {data.kpi.last_visit_days_ago === null ? t('membership.analytics.never') : data.kpi.last_visit_days_ago === 0 ? t('membership.analytics.today') : data.kpi.last_visit_days_ago === 1 ? t('membership.analytics.yesterday') : t('membership.analytics.days_ago', { days: data.kpi.last_visit_days_ago })}
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title={t('membership.analytics.engagement')} desc={t('membership.analytics.engagement_desc')}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.utilization')}</p>
                                <p className={`mt-0.5 text-3xl font-bold tracking-tight ${
                                    data.utilization_rate >= 80 ? 'text-emerald-600' : data.utilization_rate >= 40 ? 'text-amber-600' : 'text-rose-600'
                                }`}>{data.utilization_rate}%</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">{t('membership.analytics.benchmark')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.consistency')}</p>
                                <p className={`mt-0.5 text-3xl font-bold tracking-tight ${
                                    data.consistency_score >= 50 ? 'text-emerald-600' : data.consistency_score >= 20 ? 'text-amber-600' : 'text-rose-600'
                                }`}>{data.consistency_score}%</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">{t('membership.analytics.days_visited_period')}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.current_streak')}</p>
                                <p className={`mt-0.5 text-lg font-bold ${
                                    data.streak.current >= 5 ? 'text-emerald-600' : data.streak.current >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                                }`}>{data.streak.current}d</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.longest_streak')}</p>
                                <p className={`mt-0.5 text-lg font-bold ${
                                    data.streak.longest >= 5 ? 'text-emerald-600' : data.streak.longest >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                                }`}>{data.streak.longest}d</p>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title={t('membership.analytics.risk_behavior')} desc={t('membership.analytics.risk_behavior_desc')}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.churn_risk')}</p>
                                <p className={`mt-0.5 text-3xl font-bold tracking-tight ${
                                    data.kpi.churn_risk === 'Low' ? 'text-emerald-600' : data.kpi.churn_risk === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                                }`}>{data.kpi.churn_risk}</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">{t('membership.analytics.score')}: {data.kpi.churn_score}</p>
                            </div>
                            <div className={`rounded-none px-3 py-1.5 text-xs font-semibold ${
                                data.kpi.churn_risk === 'Low' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                data.kpi.churn_risk === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            }`}>
                                {data.kpi.churn_risk === 'Low' ? t('membership.analytics.stable') : data.kpi.churn_risk === 'Medium' ? t('membership.analytics.warning') : t('membership.analytics.critical')}
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-xs text-muted-foreground">{t('membership.analytics.peak_period')}</p>
                                <p className="mt-0.5 text-xl font-bold">{data.kpi.peak_velocity_period.split(' ')[0]}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{data.kpi.peak_velocity_period}</p>
                        </div>
                    </div>
                </Section>
            </div>

            <Section title={t('membership.analytics.attendance_calendar')} desc={t('membership.analytics.attendance_calendar_desc')}>
                <CalendarHeatmap dates={data.attendance_dates} />
            </Section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.weekly_compare')} desc={t('membership.analytics.weekly_compare_desc')}>
                    <div className="flex h-[200px] items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[
                                { label: t('membership.analytics.last_week'), visits: data.weekly_comparison.last_week },
                                { label: t('membership.analytics.this_week'), visits: data.weekly_comparison.this_week },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" fontSize={12} />
                                <YAxis fontSize={12} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="visits" fill="#6366f1" radius={[6, 6, 0, 0]} name={t('membership.analytics.chart_visits')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {data.weekly_comparison.change !== 0 && (
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            {data.weekly_comparison.change > 0 ? '↑' : '↓'} {Math.abs(data.weekly_comparison.change)}% {t('membership.analytics.vs_last_week')}
                        </p>
                    )}
                </Section>

                <Section title={t('membership.analytics.monthly_active_days')} desc={t('membership.analytics.monthly_active_days_desc')}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.monthly_active_days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" fontSize={10} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="active_days" fill="#10b981" radius={[4, 4, 0, 0]} name={t('membership.analytics.chart_active_days')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.favorite_days')} desc={t('membership.analytics.favorite_days_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.favorite_days}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" fontSize={11} />
                            <YAxis yAxisId="left" fontSize={12} allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} domain={[0, 24]} tickFormatter={(v) => `${Math.floor(v)}:00`} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="visit_count" fill="#6366f1" name={t('membership.analytics.chart_visits')} radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="avg_arrival_hour" stroke="#f59e0b" strokeWidth={2} name={t('membership.analytics.chart_avg_arrival')} dot={{ r: 4 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.visit_hour_dist')} desc={t('membership.analytics.visit_hour_dist_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.visit_hour_distribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" fontSize={9} interval={1} />
                            <YAxis fontSize={11} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} name={t('membership.analytics.chart_visits')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section title={t('membership.analytics.session_duration_trend')} desc={t('membership.analytics.session_duration_trend_desc')}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={data.duration_trend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => {
 const d = new Date(v);

 return `${d.getMonth() + 1}/${d.getDate()}`; 
}} />
                            <YAxis fontSize={11} label={{ value: t('membership.analytics.minutes'), angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                            <Tooltip labelFormatter={(v: string) => new Date(v).toLocaleDateString()} formatter={(v: number) => [`${v} ${t('membership.analytics.min')}`, t('membership.analytics.chart_duration')]} />
                            <Line type="monotone" dataKey="duration_minutes" stroke="#10b981" strokeWidth={2} dot={false} name={t('membership.analytics.chart_duration')} />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>

                <Section title={t('membership.analytics.membership_util')} desc={t('membership.analytics.membership_util_desc')}>
                    <div className="flex flex-col items-center justify-center py-4">
                        <GaugeChart value={data.utilization_rate} />
                        <p className="mt-3 text-sm text-muted-foreground">{t('membership.analytics.visits_last_30', { count: data.kpi.visits_last_30_days })}</p>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-center text-sm">
                            <div><p className="text-lg font-bold text-emerald-600">{data.consistency_score}%</p><p className="text-[10px] text-muted-foreground">{t('membership.analytics.consistency')}</p></div>
                            <div><p className="text-lg font-bold text-amber-600">{data.streak.current}d</p><p className="text-[10px] text-muted-foreground">{t('membership.analytics.current_streak')}</p></div>
                        </div>
                    </div>
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
    const { t } = useTranslation();
    const maxVal = Math.max(...data.map((h) => h.average_check_ins), 1);

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[700px]">
                <div className="mb-2 flex" style={{ paddingLeft: 60 }}>
                    {HOURS.map((h) => <div key={h} className="text-muted-foreground flex-1 text-center text-[10px]">{h}</div>)}
                </div>
                {DAYS.map((day) => (
                    <div key={day} className="mb-0.5 flex items-center">
                        <div className="w-[60px] shrink-0 pr-2 text-right text-xs font-medium text-muted-foreground">{t('membership.analytics.' + day.toLowerCase().slice(0, 3))}</div>
                        {HOURS.map((hour) => {
                            const entry = data.find((h) => h.day === day && h.hour === hour);
                            const val = entry?.average_check_ins ?? 0;
                            const intensity = maxVal > 0 ? Math.min(val / maxVal, 1) : 0;

                            return <div key={`${day}-${hour}`} className="flex-1" title={`${t('membership.analytics.' + day.toLowerCase())} ${hour}: ${val}`}>
                                <div className="mx-[1px] h-5 rounded-none" style={{
                                    backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${0.1 + intensity * 0.8})` : 'hsl(var(--muted))',
                                }} />
                            </div>;
                        })}
                    </div>
                ))}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{t('membership.analytics.low')}</span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => <div key={i} className="size-3 rounded-none" style={{ backgroundColor: `rgba(16, 185, 129, ${i})` }} />)}
                    <span>{t('membership.analytics.high')}</span>
                </div>
            </div>
        </div>
    );
}

function CalendarHeatmap({ dates }: { dates: AttendanceDate[] }) {
    const { t } = useTranslation();
    const dateMap = new Map<string, number>();
    dates.forEach((d) => dateMap.set(d.date, d.session_duration_minutes));

    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    const cells: { date: Date; count: number }[] = [];
    const cursor = new Date(startDate);

    while (cursor <= today) {
        const key = cursor.toISOString().split('T')[0];
        cells.push({ date: new Date(cursor), count: dateMap.get(key) ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
    }

    const maxDuration = Math.max(...dates.map((d) => d.session_duration_minutes), 1);
    const weeks: { date: Date; count: number }[][] = [];
    let currentWeek: { date: Date; count: number }[] = [];

    cells.forEach((cell, i) => {
        if (currentWeek.length === 0) {
            for (let j = 0; j < cell.date.getDay(); j++) {
currentWeek.push({ date: new Date(0), count: -1 });
}
        }

        currentWeek.push(cell);

        if (cell.date.getDay() === 6 || i === cells.length - 1) {
 weeks.push(currentWeek); currentWeek = []; 
}
    });

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-0.5" style={{ minWidth: 600 }}>
                <div className="flex flex-col gap-0.5 pr-1 pt-5">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((l, i) => {
                        const label = l ? t('membership.analytics.' + l.toLowerCase()) : '';
                        return <div key={i} className="text-muted-foreground flex h-3 items-center text-[9px]">{label}</div>;
                    })}
                </div>
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                        {week.map((cell, ci) => {
                            if (cell.count < 0) {
return <div key={ci} className="size-3" />;
}

                            const intensity = cell.count > 0 ? Math.min(cell.count / maxDuration, 1) : 0;

                            return <div key={ci} className="size-3 rounded-[2px]"
                                title={`${cell.date.toLocaleDateString()}: ${cell.count > 0 ? `${cell.count} ${t('membership.analytics.min')}` : t('membership.analytics.no_visit')}`}
                                style={{ backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${0.15 + intensity * 0.75})` : 'hsl(var(--muted))' }} />;
                        })}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{t('membership.analytics.less')}</span>
                {[0, 0.25, 0.5, 0.75, 1].map((i) => (
                    <div key={i} className="size-3 rounded-[2px]" style={{ backgroundColor: i > 0 ? `rgba(16, 185, 129, ${i})` : 'hsl(var(--muted))' }} />
                ))}
                <span>{t('membership.analytics.more')}</span>
            </div>
        </div>
    );
}

function GaugeChart({ value }: { value: number }) {
    const { t } = useTranslation();
    const cx = 100; const cy = 100; const r = 75; const sw = 16;
    const angle = Math.min(value / 100, 1) * 180;
    const rad = (angle * Math.PI) / 180;
    const x = cx + r * Math.sin(rad);
    const y = cy - r * Math.cos(rad);
    const largeArc = angle > 90 ? 1 : 0;
    const color = value >= 80 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <svg width={200} height={140} viewBox="0 0 200 140">
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="hsl(var(--muted))" strokeWidth={sw} strokeLinecap="round" />
            {value > 0 && <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />}
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground" fontSize={26} fontWeight="bold">{value}%</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>{t('membership.analytics.utilization')}</text>
        </svg>
    );
}

Analytics.layout = { breadcrumbs: [{ title: i18n.t('membership.analytics.title'), href: '/membership/analytics' }] };
