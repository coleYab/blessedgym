import { Form, Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import {
    ArrowDown,
    ArrowUp,
    Download,
    FileDown,
    Landmark,
    PiggyBank,
    Plus,
    Receipt,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
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
import InputError from '@/components/input-error';
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

type Expense = {
    id: number;
    description: string;
    category: string;
    amount: string;
    expense_date: string;
    notes: string | null;
};

type RevenueByPlan = { name: string; revenue: number };

type MonthlyPnl = { month: string; revenue: number; expenses: number; profit: number };

type RecentPayment = {
    id: number; member_name: string; amount: number;
    refund_amount: number; method: string; date: string; is_refunded: boolean;
};

type RefundEntry = {
    id: number; member_name: string; refund_amount: number;
    refund_reason: string | null; refunded_at: string | null; original_amount: number;
};

type ExpenseCategory = { category: string; total: number };

type DailyRevenue = { date: string; revenue: number };

type PageProps = {
    total_revenue: number;
    gross_revenue: number;
    total_expenses: number;
    net_profit: number;
    total_revenue_invoiced: number;
    total_refunds: number;
    total_paid_plans: number;
    active_members: number;
    total_members: number;
    expenses_by_category: ExpenseCategory[];
    daily_revenue: DailyRevenue[];
    recent_payments: RecentPayment[];
    refunds_list: RefundEntry[];
    revenue_by_plan: RevenueByPlan[];
    monthly_pnl: MonthlyPnl[];
    expenses: { data: Expense[] };
    period: string;
    year: number;
    month: number;
};

const PERIODS = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Annual' },
];

const CATEGORY_COLORS: Record<string, string> = {
    Utilities: '#6366f1',
    Equipment: '#f59e0b',
    Salaries: '#10b981',
    Rent: '#e11d48',
    Marketing: '#8b5cf6',
    Supplies: '#06b6d4',
    Other: '#64748b',
};

const EXPENSE_CATEGORIES = ['Utilities', 'Equipment', 'Salaries', 'Rent', 'Marketing', 'Supplies', 'Other'];

export default function RevenueDashboard() {
    const { t } = useTranslation();
    const {
        total_revenue, gross_revenue, total_expenses, net_profit,
        total_revenue_invoiced, total_refunds, total_paid_plans,
        active_members, total_members,
        expenses_by_category, daily_revenue, recent_payments, refunds_list,
        revenue_by_plan, monthly_pnl, expenses, period, year, month,
    } = usePage<PageProps>().props;

    const navigate = (params: Record<string, string | number>) => {
        router.get('/billing/revenue', params, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('billing.revenue.title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={t('billing.revenue.title')}
                        description={t('billing.revenue.description')}
                    />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate({ period, year, month, export: 'csv' })} asChild>
                            <a href={`/billing/revenue/export/csv?period=${period}&year=${year}&month=${month}`}>
                                <FileDown className="mr-1 size-4" />
                                CSV
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate({ period, year, month, export: 'pdf' })} asChild>
                            <a href={`/billing/revenue/export/pdf?period=${period}&year=${year}&month=${month}`}>
                                <Download className="mr-1 size-4" />
                                PDF
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-none border p-1">
                        {PERIODS.map((p) => (
                            <button key={p.value} onClick={() => navigate({ period: p.value, year, month })}
                                className={`rounded-none px-3 py-1.5 text-xs font-medium transition-colors ${period === p.value ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {period === 'monthly' && (
                        <div className="flex items-center gap-2">
                            <select value={month} onChange={(e) => navigate({ period, year, month: e.target.value })}
                                className="border-input flex h-8 rounded-none border bg-transparent px-2 text-xs">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={year} onChange={(e) => navigate({ period, month, year: e.target.value })}
                                className="border-input flex h-8 rounded-none border bg-transparent px-2 text-xs">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <option key={nowYear() - i} value={nowYear() - i}>{nowYear() - i}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {period === 'yearly' && (
                        <select value={year} onChange={(e) => navigate({ period, year: e.target.value })}
                            className="border-input flex h-8 rounded-none border bg-transparent px-2 text-xs">
                            {Array.from({ length: 5 }, (_, i) => (
                                <option key={nowYear() - i} value={nowYear() - i}>{nowYear() - i}</option>
                            ))}
                        </select>
                    )}
                </div>

                <KpiCards
                    totalRevenue={total_revenue}
                    totalExpenses={total_expenses}
                    netProfit={net_profit}
                    outstandingRevenue={total_revenue_invoiced}
                    totalRefunds={total_refunds}
                    activeMembers={active_members}
                    totalPaidPlans={total_paid_plans}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title="Daily Revenue Trend" desc="Revenue per day in selected period">
                        {daily_revenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={daily_revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={10} tickFormatter={(v: string) => v.slice(5)} />
                                    <YAxis fontSize={11} tickFormatter={(v: number) => `$${v}`} />
                                    <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} labelFormatter={(v: string) => new Date(v).toLocaleDateString()} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} name="Revenue" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                                {t('billing.revenue.no_data')}
                            </div>
                        )}
                    </Section>

                    <Section title="Revenue by Plan" desc="Breakdown by membership plan type">
                        {revenue_by_plan.length > 0 ? (
                            <div className="flex h-[280px] items-center justify-center">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={revenue_by_plan} cx="50%" cy="50%" outerRadius={90} paddingAngle={3}
                                            dataKey="revenue" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {revenue_by_plan.map((e, i) => (
                                                <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#06b6d4'][i % 6]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                                No plan revenue data.
                            </div>
                        )}
                    </Section>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title="Monthly P&amp;L" desc="Revenue vs Expenses vs Profit (year)">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthly_pnl}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" fontSize={11} />
                                <YAxis fontSize={11} tickFormatter={(v: number) => `$${v}`} />
                                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, '']} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} name="Profit" dot={{ r: 3 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title="Expenses by Category" desc="Breakdown in selected period">
                        {expenses_by_category.length > 0 ? (
                            <div className="flex h-[300px] items-center justify-center">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={expenses_by_category} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                                            paddingAngle={3} dataKey="total" label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                                            {expenses_by_category.map((e, i) => (
                                                <Cell key={i} fill={CATEGORY_COLORS[e.category] ?? '#64748b'} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Total']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                                No expenses recorded.
                            </div>
                        )}
                    </Section>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t('billing.revenue.expense_tracking')}</h3>
                    <AddExpenseDialog />
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                            No expenses recorded. Add an expense to start tracking.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {expenses.data.map((exp) => (
                                    <TableRow key={exp.id}>
                                        <TableCell className="font-medium">{exp.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" style={{ borderColor: CATEGORY_COLORS[exp.category] }}>
                                                {exp.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">{exp.expense_date}</TableCell>
                                        <TableCell className="text-right font-mono">${parseFloat(exp.amount).toFixed(2)}</TableCell>
                                        <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">{exp.notes ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <form action={`/billing/expenses/${exp.id}`} method="post" className="inline"
                                                onSubmit={(e) => {
 if (!confirm('Delete this expense?')) {
e.preventDefault();
} 
}}>
                                                <input type="hidden" name="_method" value="delete" />
                                                <Button type="submit" variant="ghost" size="sm">Delete</Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Separator />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title="Recent Payments" desc="Latest 10 transactions">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent_payments.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payments.</TableCell></TableRow>
                                )}
                                {recent_payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="text-sm">{p.member_name}</TableCell>
                                        <TableCell className={`text-right font-mono text-sm ${p.is_refunded ? 'text-rose-600 line-through' : ''}`}>
                                            ${p.amount.toFixed(2)}
                                            {p.is_refunded && <span className="ml-1 text-[10px]">(refunded)</span>}
                                        </TableCell>
                                        <TableCell className="text-xs">{p.method.replace('_', ' ')}</TableCell>
                                        <TableCell className="text-xs">{p.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Section>

                    <Section title="Refund Activity" desc="Recent refunds in selected period">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member</TableHead>
                                    <TableHead className="text-right">Refund</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {refunds_list.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No refunds in this period.</TableCell></TableRow>
                                )}
                                {refunds_list.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="text-sm">{r.member_name}</TableCell>
                                        <TableCell className="text-right font-mono text-sm text-rose-600">-${r.refund_amount.toFixed(2)}</TableCell>
                                        <TableCell className="max-w-[150px] truncate text-xs">{r.refund_reason ?? '—'}</TableCell>
                                        <TableCell className="text-xs">{r.refunded_at ?? '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Section>
                </div>
            </div>
        </>
    );
}

function nowYear() {
    return new Date().getFullYear();
}

function KpiCards({ totalRevenue, totalExpenses, netProfit, outstandingRevenue, totalRefunds, activeMembers, totalPaidPlans }: {
    totalRevenue: number; totalExpenses: number; netProfit: number;
    outstandingRevenue: number; totalRefunds: number; activeMembers: number; totalPaidPlans: number;
}) {
    const items = [
        { label: i18n.t('billing.revenue.total'), value: totalRevenue, icon: TrendingUp, color: 'text-emerald-600', prefix: '$' },
        { label: i18n.t('billing.revenue.expenses'), value: totalExpenses, icon: TrendingDown, color: 'text-rose-600', prefix: '$' },
        { label: i18n.t('billing.revenue.profit'), value: netProfit, icon: PiggyBank, color: netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600', prefix: '$' },
        { label: 'Outstanding', value: outstandingRevenue, icon: Receipt, color: 'text-amber-600', prefix: '$' },
        { label: 'Total Refunds', value: totalRefunds, icon: ArrowDown, color: 'text-rose-600', prefix: '$' },
        { label: 'Paid Plans', value: totalPaidPlans, icon: Landmark, color: 'text-blue-600', prefix: '' },
        { label: 'Active Members', value: activeMembers, icon: ArrowUp, color: 'text-emerald-600', prefix: '' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {items.map((k) => (
                <Card key={k.label}>
                    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-medium text-muted-foreground">{k.label}</CardTitle>
                        <k.icon className={`size-3 ${k.color}`} />
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                        <p className={`text-lg font-bold ${k.color}`}>
                            {k.prefix}{k.value.toLocaleString('en-US', { minimumFractionDigits: k.prefix === '$' ? 2 : 0 })}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function AddExpenseDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" />
                    Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <Form
                    action="/billing/expenses"
                    method="post"
                    resetOnSuccess
                    className="space-y-4"
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Record Expense</DialogTitle>
                                <DialogDescription>
                                    Track a business expense (utilities, equipment, salaries, etc.).
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" required placeholder="e.g. Monthly electricity bill" />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select id="category" name="category"
                                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                        required>
                                        <option value="">Select...</option>
                                        {EXPENSE_CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" />
                                    <InputError message={errors.amount} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="expense_date">Date</Label>
                                    <Input id="expense_date" name="expense_date" type="date" required />
                                    <InputError message={errors.expense_date} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <textarea id="notes" name="notes" rows={2}
                                    className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm" />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button disabled={processing}>{processing ? 'Saving...' : 'Save Expense'}</Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <Card>
            {(title || desc) && <CardHeader><CardTitle className="text-base">{title}</CardTitle>
                {desc && <CardDescription>{desc}</CardDescription>}</CardHeader>}
            <CardContent>{children}</CardContent>
        </Card>
    );
}

RevenueDashboard.layout = {
    breadcrumbs: [
        { title: i18n.t('billing.revenue.title'), href: '/billing/revenue' },
    ],
};
