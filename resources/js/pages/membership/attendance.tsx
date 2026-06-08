import { Head, router, usePage } from '@inertiajs/react';
import { CalendarArrowDown, CalendarArrowUp, FilterX, ListFilter, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Member = { id: number; first_name: string; last_name: string; email: string };

type LogEntry = {
    id: number;
    member_id: number;
    check_in_timestamp: string;
    check_out_timestamp: string | null;
    check_in_method: string;
    duration_minutes: number | null;
    status: string;
    date: string;
    check_in_time: string;
    check_out_time: string | null;
};

type Summary = {
    total_visits: number;
    completed_visits: number;
    avg_duration_minutes: number;
    unique_days: number;
    most_frequent_method: string;
    current_streak: number;
};

type Filters = {
    member_id: string | null;
    date_from: string | null;
    date_to: string | null;
    search: string | null;
};

type PageProps = {
    logs: { data: LogEntry[]; current_page: number; last_page: number; per_page: number; total: number };
    member: Member | null;
    members: Member[];
    summary: Summary | null;
    filters: Filters;
};

const DATE_PRESETS = [
    { label: 'today', days: 0 },
    { label: 'this_week', days: null, type: 'week' as const },
    { label: 'this_month', days: null, type: 'month' as const },
    { label: 'last_30', days: 30 },
    { label: 'last_90', days: 90 },
];

const METHOD_BADGES: Record<string, string> = {
    QR_Code: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    Bar_Code: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    Manual_Admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    RFID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
};

export default function AttendanceHistory() {
    const { t } = useTranslation();
    const { logs, member, members, summary, filters } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = useCallback((params: Record<string, string | number | undefined>) => {
        router.get('/membership/attendance', params, { preserveState: true, preserveScroll: true });
    }, []);

    const hasActiveFilters = !!(filters.date_from || filters.date_to);

    const handleMemberSelect = useCallback((m: Member) => {
        setShowResults(false);
        setSearchQuery(`${m.first_name} ${m.last_name}`);
        navigate({
            member_id: m.id,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        });
    }, [navigate, dateFrom, dateTo]);

    const applyDateFilter = useCallback((from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        setFilterOpen(false);
        const params: Record<string, string | number | undefined> = {
            date_from: from || undefined,
            date_to: to || undefined,
        };

        if (member) {
params.member_id = member.id;
}

        navigate(params);
    }, [navigate, member]);

    const handlePreset = useCallback((preset: typeof DATE_PRESETS[number]) => {
        let from = '';
        let to = '';

        if (preset.days === 0) {
            from = to = new Date().toISOString().split('T')[0];
        } else if (preset.type === 'week') {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            from = monday.toISOString().split('T')[0];
            to = now.toISOString().split('T')[0];
        } else if (preset.type === 'month') {
            const now = new Date();
            from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            to = now.toISOString().split('T')[0];
        } else if (preset.days) {
            const now = new Date();
            const past = new Date(now);
            past.setDate(now.getDate() - preset.days);
            from = past.toISOString().split('T')[0];
            to = now.toISOString().split('T')[0];
        }

        applyDateFilter(from, to);
    }, [applyDateFilter]);

    const clearFilters = useCallback(() => {
        setDateFrom('');
        setDateTo('');
        setFilterOpen(false);

        if (member) {
navigate({ member_id: member.id });
}
    }, [navigate, member]);

    const handlePageChange = useCallback((page: number) => {
        const params: Record<string, string | number | undefined> = { page };

        if (member) {
params.member_id = member.id;
}

        if (filters.date_from) {
params.date_from = filters.date_from;
}

        if (filters.date_to) {
params.date_to = filters.date_to;
}

        navigate(params);
    }, [navigate, member, filters.date_from, filters.date_to]);

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
                const res = await fetch(`/membership/attendance/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data);
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

    useEffect(() => {
        if (member) {
setSearchQuery(`${member.first_name} ${member.last_name}`);
}
    }, [member]);

    return (
        <>
            <Head title={t('membership.attendance.title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={t('membership.attendance.title')}
                    description={t('membership.attendance.description')}
                />

                <div className="relative" ref={searchRef}>
                    <Label className="text-xs font-medium text-muted-foreground">{t('membership.attendance.select_member')}</Label>
                    <div className="relative mt-1.5">
                        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input
                            placeholder={t('membership.attendance.search_placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                        {searching && (
                            <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        )}
                    </div>

                    {showResults && searchResults.length > 0 && (
                        <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-none border shadow-lg">
                            {searchResults.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => handleMemberSelect(m)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent first:rounded-none last:rounded-none"
                                >
                                    <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                        {m.first_name[0]}{m.last_name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{m.first_name} {m.last_name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {member ? (
                    <>
                        <div className="flex items-center justify-between rounded-none border bg-muted/30 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted flex size-9 items-center justify-center rounded-full text-sm font-medium">
                                    {member.first_name[0]}{member.last_name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.first_name} {member.last_name}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="gap-1 text-[11px]">
                                        <CalendarArrowDown className="size-3" />
                                        {filters.date_from} {filters.date_to ? `— ${filters.date_to}` : ''}
                                    </Badge>
                                )}
                                <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <ListFilter className="size-3.5" />
                                            {t('membership.attendance.filters')}
                                            {hasActiveFilters && <span className="bg-primary text-primary-foreground ml-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">!</span>}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                        <DialogTitle>{t('membership.attendance.date_filters')}</DialogTitle>
                                        <DialogDescription>
                                            {t('membership.attendance.date_description', { name: `${member.first_name} ${member.last_name}` })}
                                        </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {DATE_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.label}
                                                        onClick={() => handlePreset(preset)}
                                                        className="rounded-none border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                                    >
                                                        {t(`membership.attendance.${preset.label}`)}
                                                    </button>
                                                ))}
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="filter-from" className="text-xs">{t('membership.attendance.from')}</Label>
                                                    <Input
                                                        id="filter-from"
                                                        type="date"
                                                        value={dateFrom}
                                                        onChange={(e) => setDateFrom(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="filter-to" className="text-xs">{t('membership.attendance.to')}</Label>
                                                    <Input
                                                        id="filter-to"
                                                        type="date"
                                                        value={dateTo}
                                                        onChange={(e) => setDateTo(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="gap-2 sm:gap-0">
                                            {(dateFrom || dateTo) && (
                                                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                                                    <FilterX className="size-3.5" />
                                                    {t('membership.attendance.clear')}
                                                </Button>
                                            )}
                                            <Button size="sm" onClick={() => applyDateFilter(dateFrom, dateTo)}>
                                                {t('membership.attendance.apply')}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {summary && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-none border bg-card">
                                    <div className="border-b bg-muted/20 px-4 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('membership.attendance.visit_overview')}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] text-muted-foreground">{t('membership.attendance.total_visits')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight">{summary.total_visits}</p>
                                        <div className="mt-3 flex items-center gap-4 border-t pt-3 text-sm">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">{t('membership.attendance.completed')}</p>
                                                <p className="mt-0.5 text-lg font-bold">{summary.completed_visits}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">{t('membership.attendance.avg_duration')}</p>
                                                <p className="mt-0.5 text-lg font-bold">{summary.avg_duration_minutes > 0 ? `${Math.round(summary.avg_duration_minutes)}m` : '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-none border bg-card">
                                    <div className="border-b bg-muted/20 px-4 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('membership.attendance.consistency')}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] text-muted-foreground">{t('membership.attendance.unique_days')}</p>
                                        <p className="mt-0.5 text-3xl font-bold tracking-tight">{summary.unique_days}</p>
                                        <div className="mt-3 flex items-center gap-4 border-t pt-3 text-sm">
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">{t('membership.attendance.current_streak')}</p>
                                                <p className={`mt-0.5 text-lg font-bold ${
                                                    summary.current_streak >= 5 ? 'text-emerald-600' : summary.current_streak >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                                                }`}>{summary.current_streak}d</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-none border bg-card">
                                    <div className="border-b bg-muted/20 px-4 py-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t('membership.attendance.behavior')}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[11px] text-muted-foreground">{t('membership.attendance.top_method')}</p>
                                        <p className="mt-0.5 text-2xl font-bold tracking-tight">{summary.most_frequent_method.replace('_', ' ')}</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">{t('membership.attendance.most_used')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Card className="overflow-hidden">
                            <CardHeader className="border-b bg-muted/20 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-semibold">{t('membership.attendance.checkin_logs')}</CardTitle>
                                        <CardDescription className="text-xs">{logs.total} {t(logs.total === 1 ? 'membership.attendance.record' : 'membership.attendance.records')}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.date')}</TableHead>
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.check_in')}</TableHead>
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.check_out')}</TableHead>
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.duration')}</TableHead>
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.method')}</TableHead>
                                            <TableHead className="h-9 px-4 text-[11px] font-semibold">{t('membership.attendance.status')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CalendarArrowUp className="text-muted-foreground size-8" />
                                                        <p className="text-sm text-muted-foreground">{t('membership.attendance.no_records')}</p>
                                                        <p className="text-xs text-muted-foreground/60">{t('membership.attendance.try_adjusting')}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.data.map((log) => (
                                                <TableRow key={log.id} className="group">
                                                    <TableCell className="px-4 py-3">
                                                        <span className="font-medium text-sm">{log.date}</span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <span className="text-sm">{log.check_in_time}</span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {log.check_out_time ? (
                                                            <span className="text-sm">{log.check_out_time}</span>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-[10px] font-normal">{t('membership.attendance.in_progress')}</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {log.duration_minutes !== null ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="bg-muted h-1.5 w-12 overflow-hidden rounded-full">
                                                                    <div
                                                                        className="h-full rounded-full bg-muted-foreground/40"
                                                                        style={{ width: `${Math.min((log.duration_minutes / 120) * 100, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs tabular-nums text-muted-foreground">{log.duration_minutes}m</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/60">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <Badge className={`${METHOD_BADGES[log.check_in_method] ?? 'bg-muted text-muted-foreground'} text-[11px] font-medium`} variant="secondary">
                                                            {log.check_in_method.replace('_', ' ')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <Badge variant={log.status === 'Completed' ? 'outline' : 'default'} className="text-[11px]">
                                                            {log.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {logs.last_page > 1 && (
                                <div className="flex items-center justify-between border-t px-4 py-3">
                                    <p className="text-xs text-muted-foreground/60">
                                        {t('membership.attendance.page', { current: logs.current_page, total: logs.last_page })}
                                    </p>
                                    <div className="flex gap-1.5">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={logs.current_page <= 1}
                                            onClick={() => handlePageChange(logs.current_page - 1)}
                                        >
                                            {t('membership.attendance.previous')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={logs.current_page >= logs.last_page}
                                            onClick={() => handlePageChange(logs.current_page + 1)}
                                        >
                                            {t('membership.attendance.next')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16">
                            <Users className="text-muted-foreground/40 size-12" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground">{t('membership.attendance.no_member')}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground/60">
                                    {t('membership.attendance.no_member_desc')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AttendanceHistory.layout = { breadcrumbs: [{ title: i18n.t('membership.attendance.title'), href: '/membership/attendance' }] };
