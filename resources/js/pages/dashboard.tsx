import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
    return (
        <div className="flex flex-col justify-between border border-border bg-card p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <span className="mt-1 text-2xl font-bold text-card-foreground">{value}</span>
            {subtitle && (
                <span className="mt-1 text-xs text-muted-foreground">{subtitle}</span>
            )}
        </div>
    );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | null)[][] }) {
    return (
        <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-muted border-b border-border">
                        {headers.map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-3 py-6 text-center text-muted-foreground">
                                No data yet.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr key={i} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                                {row.map((cell, j) => (
                                    <td key={j} className="px-3 py-2 text-foreground">
                                        {cell ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatTime(dt: string): string {
    return new Date(dt).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

interface DashboardStats {
    activeMembers: number;
    checkedInToday: number;
    revenueThisMonth: number;
    outstandingBalance: number;
    staffClockedIn: number;
    pendingLeave: number;
    expiringSoon: number;
    totalMembers: number;
    newThisMonth: number;
}

interface CheckinRow {
    id: number;
    member: string;
    check_in: string;
    check_out: string | null;
    method: string;
}

interface PaymentRow {
    id: number;
    member: string;
    amount: number;
    method: string;
    timestamp: string;
}

interface DashboardProps {
    stats: DashboardStats;
    recentCheckins: CheckinRow[];
    recentPayments: PaymentRow[];
}

export default function Dashboard({ stats, recentCheckins, recentPayments }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome back. Here is what is happening at Blessed Gym today.
                    </p>
                </div>

                {stats.expiringSoon > 0 && (
                    <div className="border border-border bg-card p-3 text-sm text-card-foreground">
                        <span className="font-semibold">{stats.expiringSoon}</span>{' '}
                        {stats.expiringSoon === 1 ? 'membership is' : 'memberships are'} expiring within the next 7 days.
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <StatCard label="Active Members" value={stats.activeMembers} subtitle={`${stats.totalMembers} total`} />
                    <StatCard label="Check-ins Today" value={stats.checkedInToday} />
                    <StatCard label="Revenue This Month" value={formatCurrency(stats.revenueThisMonth)} />
                    <StatCard label="Outstanding Balance" value={formatCurrency(stats.outstandingBalance)} />
                    <StatCard label="Staff Clocked In" value={stats.staffClockedIn} subtitle={`${stats.pendingLeave} pending leave`} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Check-ins</h2>
                        <Table
                            headers={['Member', 'Time', 'Status', 'Method']}
                            rows={recentCheckins.map((c) => [
                                c.member,
                                formatDateTime(c.check_in),
                                c.check_out ? `Out ${formatTime(c.check_out)}` : 'Active',
                                c.method.replace(/_/g, ' '),
                            ])}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Payments</h2>
                        <Table
                            headers={['Member', 'Amount', 'Method', 'Date']}
                            rows={recentPayments.map((p) => [
                                p.member,
                                formatCurrency(p.amount),
                                p.method.replace(/_/g, ' '),
                                formatDateTime(p.timestamp),
                            ])}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
