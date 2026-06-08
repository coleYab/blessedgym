import { Form, Head, usePage } from '@inertiajs/react';
import { CalendarCheck, CheckCircle, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type LeaveRequest = {
    id: number;
    staff_profile_id: number;
    staff_name: string;
    staff_email: string;
    leave_type: string;
    status: 'Pending' | 'Approved' | 'Denied';
    start_date: string;
    end_date: string;
    reason: string | null;
    approved_by_name: string | null;
    approved_at: string | null;
    denial_reason: string | null;
    created_at: string;
};

type StaffOption = { id: number; name: string };

type PageProps = {
    requests: { data: LeaveRequest[] };
    staff: StaffOption[];
    managerStaff: StaffOption[];
};

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    Pending: 'secondary',
    Approved: 'default',
    Denied: 'destructive',
};

const LEAVE_TYPES = ['Sick', 'Vacation', 'Personal', 'Family_Emergency', 'Other'];

export default function LeaveAbsence() {
    const { t } = useTranslation();
    const { requests, staff, managerStaff } = usePage<PageProps>().props;

    return (
        <>
            <Head title={t('employee.leave.title')} />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={t('employee.leave.title')}
                    description={t('employee.leave.description')}
                />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarCheck className="size-4" />
                        <span>{t('employee.leave.requests_count', { count: requests.data.length })}</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block size-2 rounded-full bg-emerald-500" />
                            {requests.data.filter((r) => r.status === 'Approved').length} {t('employee.leave.approved')}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block size-2 rounded-full bg-amber-500" />
                            {requests.data.filter((r) => r.status === 'Pending').length} {t('employee.leave.pending')}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block size-2 rounded-full bg-rose-500" />
                            {requests.data.filter((r) => r.status === 'Denied').length} {t('employee.leave.denied')}
                        </span>
                    </div>

                    <ApplyLeaveDialog staff={staff} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('employee.leave.requests_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('employee.leave.staff')}</TableHead>
                                    <TableHead>{t('employee.leave.type')}</TableHead>
                                    <TableHead>{t('employee.leave.dates')}</TableHead>
                                    <TableHead>{t('employee.leave.reason')}</TableHead>
                                    <TableHead>{t('employee.leave.status')}</TableHead>
                                    <TableHead>{t('employee.leave.approved_by')}</TableHead>
                                    <TableHead className="text-right">{t('employee.leave.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2 py-6">
                                                <CalendarCheck className="size-8 text-muted-foreground/50" />
                                                <p>{t('employee.leave.no_requests')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {requests.data.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm font-medium">{r.staff_name}</p>
                                                <p className="text-xs text-muted-foreground">{r.staff_email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{r.leave_type.replace('_', ' ')}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {r.start_date} → {r.end_date}
                                            <p className="text-muted-foreground">
                                                {Math.ceil(
                                                    (new Date(r.end_date).getTime() -
                                                        new Date(r.start_date).getTime()) /
                                                        (1000 * 60 * 60 * 24),
                                                ) + 1}{' '}
                                                day{Math.ceil(
                                                    (new Date(r.end_date).getTime() -
                                                        new Date(r.start_date).getTime()) /
                                                        (1000 * 60 * 60 * 24),
                                                ) + 1 !== 1
                                                    ? 's'
                                                    : ''}
                                            </p>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-xs">
                                            {r.reason ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_BADGE[r.status]}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {r.approved_by_name ? (
                                                <div>
                                                    <p>{r.approved_by_name}</p>
                                                    <p className="text-muted-foreground">{r.approved_at}</p>
                                                </div>
                                            ) : r.denial_reason ? (
                                                <span title={r.denial_reason} className="text-rose-600">
                                                    {r.denial_reason.length > 30
                                                        ? r.denial_reason.slice(0, 30) + '…'
                                                        : r.denial_reason}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {r.status === 'Pending' && (
                                                    <>
                                                        <ApproveDialog requestId={r.id} managerStaff={managerStaff} />
                                                        <DenyDialog requestId={r.id} />
                                                        <form
                                                            action={`/employee/leave/${r.id}`}
                                                            method="post"
                                                            className="inline"
                                                            onSubmit={(e) => {
                                                                if (!confirm(t('employee.leave.confirm_delete'))) {
e.preventDefault();
}
                                                            }}
                                                        >
                                                            <input type="hidden" name="_method" value="delete" />
                                                            <Button type="submit" variant="ghost" size="sm">
                                                                {t('employee.leave.delete')}
                                                            </Button>
                                                        </form>
                                                    </>
                                                )}
                                                {r.status !== 'Pending' && (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function ApplyLeaveDialog({ staff }: { staff: StaffOption[] }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-1 size-4" />
                    {t('employee.leave.apply')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <Form
                    action="/employee/leave"
                    method="post"
                    resetOnSuccess
                    className="space-y-4"
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                            <DialogTitle>{t('employee.leave.apply_title')}</DialogTitle>
                            <DialogDescription>
                                {t('employee.leave.apply_desc')}
                            </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="staff_profile_id">{t('employee.leave.staff_member')}</Label>
                                <select
                                    id="staff_profile_id"
                                    name="staff_profile_id"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    required
                                >
                                    <option value="">{t('employee.leave.select_staff')}</option>
                                    {staff.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.staff_profile_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="leave_type">{t('employee.leave.leave_type')}</Label>
                                <select
                                    id="leave_type"
                                    name="leave_type"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    required
                                >
                                    <option value="">{t('employee.leave.select_type')}</option>
                                    {LEAVE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <InputError message={errors.leave_type} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">{t('employee.leave.start')}</Label>
                                    <Input id="start_date" name="start_date" type="date" required />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">{t('employee.leave.end')}</Label>
                                    <Input id="end_date" name="end_date" type="date" required />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">{t('employee.leave.reason_label')}</Label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows={3}
                                    className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                />
                                <InputError message={errors.reason} />
                            </div>

                            <InputError message={errors.overlap} />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    {t('employee.leave.cancel')}
                                </Button>
                                <Button disabled={processing}>
                                    {processing ? t('employee.leave.submitting') : t('employee.leave.submit')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function ApproveDialog({ requestId, managerStaff }: { requestId: number; managerStaff: StaffOption[] }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default">
                    <CheckCircle className="mr-1 size-3" />
                    {t('employee.leave.approve')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action={`/employee/leave/${requestId}/approve`}
                    method="post"
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                            <DialogTitle>{t('employee.leave.approve_title')}</DialogTitle>
                            <DialogDescription>
                                {t('employee.leave.approve_desc')}
                            </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="approved_by">{t('employee.leave.approving_manager')}</Label>
                                <select
                                    id="approved_by"
                                    name="approved_by"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    required
                                >
                                    <option value="">{t('employee.leave.select_manager')}</option>
                                    {managerStaff.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.approved_by} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    {t('employee.leave.cancel')}
                                </Button>
                                <Button disabled={processing}>
                                    {processing ? t('employee.leave.approving') : t('employee.leave.confirm_approval')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function DenyDialog({ requestId }: { requestId: number }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <XCircle className="mr-1 size-3" />
                    {t('employee.leave.reject')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action={`/employee/leave/${requestId}/deny`}
                    method="post"
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                            <DialogTitle>{t('employee.leave.deny_title')}</DialogTitle>
                            <DialogDescription>
                                {t('employee.leave.deny_desc')}
                            </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-2">
                                <Label htmlFor="denial_reason">{t('employee.leave.denial_reason')}</Label>
                                <textarea
                                    id="denial_reason"
                                    name="denial_reason"
                                    rows={3}
                                    className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                />
                                <InputError message={errors.denial_reason} />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    {t('employee.leave.cancel')}
                                </Button>
                                <Button disabled={processing} variant="destructive">
                                    {processing ? t('employee.leave.denying') : t('employee.leave.deny_request')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

LeaveAbsence.layout = {
    breadcrumbs: [
        { title: i18n.t('employee.leave.breadcrumb_management'), href: '/employee/leave' },
        { title: i18n.t('employee.leave.title'), href: '/employee/leave' },
    ],
};
