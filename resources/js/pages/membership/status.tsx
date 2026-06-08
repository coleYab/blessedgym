import { Form, Head, Link } from '@inertiajs/react';
import i18n from 'i18next';
import {
    CalendarDays,
    CreditCard,
    Search,
    Snowflake,
    Users,
    XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
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

type Plan = {
    id: number;
    name: string;
    description: string | null;
    duration_days: number;
    price: string;
};

type Member = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    status: string;
    current_plan_id: number | null;
    current_plan: Plan | null;
    start_date: string | null;
    end_date: string | null;
    freeze_reason: string | null;
    freeze_start_date: string | null;
    freeze_end_date: string | null;
    cancellation_reason: string | null;
    cancellation_requested_date: string | null;
    effective_cancellation_date: string | null;
    active_session: boolean;
};

const STATUS_OPTIONS = ['all', 'Active', 'Frozen', 'Cancelled', 'Expired'] as const;

const STATUS_COLORS: Record<string, string> = {
    Active: 'bg-emerald-600 hover:bg-emerald-600',
    Frozen: 'bg-cyan-600 hover:bg-cyan-600',
    Cancelled: 'bg-rose-600 hover:bg-rose-600',
    Expired: 'bg-slate-500 hover:bg-slate-500',
};

export default function MembershipStatus({
    members,
    plans,
    search,
    statusFilter,
}: {
    members: Member[];
    plans: Plan[];
    search: string | null;
    statusFilter: string | null;
}) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Membership Status" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title={t('membership.status.title')}
                    description={t('membership.status.description')}
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action="/membership/status"
                            method="get"
                            className="flex items-end gap-4"
                        >
                            <div className="flex-1">
                                <Label htmlFor="search">
                                    {t('membership.status.search_label')}
                                </Label>
                                <div className="relative mt-2">
                                    <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                                    <Input
                                        id="search"
                                        name="search"
                                        defaultValue={search ?? ''}
                                        placeholder={t('membership.status.search_placeholder')}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <Button type="submit">{t('membership.status.search_button')}</Button>
                        </Form>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => {
                        const isActive =
                            option === 'all'
                                ? !statusFilter || statusFilter === 'all'
                                : statusFilter === option;

                        return (
                            <Link
                                key={option}
                                href={
                                    option === 'all'
                                        ? '/membership/status'
                                        : `/membership/status?status=${option}`
                               }
                                preserveState
                            >
                                <Badge
                                    variant={isActive ? 'default' : 'outline'}
                                    className={
                                        isActive && option !== 'all'
                                            ? STATUS_COLORS[option]
                                            : ''
                                    }
                                >
                                    {option === 'all'
                                        ? t('membership.status.all')
                                        : option === 'Active'
                                            ? t('membership.status.active')
                                            : option === 'Frozen'
                                                ? t('membership.status.frozen')
                                                : option === 'Cancelled'
                                                    ? t('membership.status.cancelled')
                                                    : t('membership.status.expired')}
                                </Badge>
                            </Link>
                        );
                    })}
                </div>

                {members.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {members.map((member) => (
                            <MemberStatusCard
                                key={member.id}
                                member={member}
                                plans={plans}
                            />
                        ))}
                    </div>
                )}

                {search && members.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-2 py-12">
                            <Users className="text-muted-foreground size-12" />
                            <p className="text-muted-foreground text-sm">
                                {t('membership.status.not_found')}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function MemberStatusCard({
    member,
    plans,
}: {
    member: Member;
    plans: Plan[];
}) {
    const { t } = useTranslation();
    const initials = `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                    {initials.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                        {member.first_name} {member.last_name}
                    </CardTitle>
                    <p className="text-muted-foreground truncate text-xs">
                        {member.email}
                    </p>
                </div>
                <Badge
                    variant="default"
                    className={`shrink-0 ${STATUS_COLORS[member.status] ?? ''}`}
                >
                    {member.status}
                </Badge>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('membership.status.phone')}</span>
                    <span>{member.phone_number}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="size-3.5" />
                        {t('membership.status.plan')}
                    </span>
                    <span>
                        {member.current_plan?.name ?? t('membership.status.no_plan')}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {t('membership.status.period')}
                    </span>
                    <span>
                        {member.start_date && member.end_date
                            ? `${member.start_date} — ${member.end_date}`
                            : t('membership.status.not_set')}
                    </span>
                </div>

                {member.status === 'Frozen' && member.freeze_reason && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Snowflake className="size-3.5" />
                            {t('membership.status.frozen_reason')}
                        </span>
                        <span>
                            {member.freeze_reason}
                            {member.freeze_end_date
                                ? ` ${t('membership.status.until', { date: member.freeze_end_date })}`
                                : ''}
                        </span>
                    </div>
                )}

                {member.status === 'Cancelled' && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <XCircle className="size-3.5" />
                            {t('membership.status.cancelled_status')}
                        </span>
                        <span>
                            {member.effective_cancellation_date
                                ? t('membership.status.effective', { date: member.effective_cancellation_date })
                                : ''}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {t('membership.status.in_facility')}
                    </span>
                    <span>
                        {member.active_session ? t('membership.status.yes') : t('membership.status.no')}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 pt-0">
                {member.status === 'Active' && (
                    <>
                        <FreezeDialog member={member} />
                        <CancelDialog member={member} />
                    </>
                )}

                {member.status === 'Frozen' && (
                    <>
                        <UnfreezeForm memberId={member.id} />
                        <CancelDialog member={member} />
                    </>
                )}

                {member.status === 'Expired' && (
                    <ModifyDialog member={member} plans={plans} />
                )}

                {member.status === 'Cancelled' && (
                    <ModifyDialog member={member} plans={plans} />
                )}
            </CardFooter>
        </Card>
    );
}

function FreezeDialog({ member }: { member: Member }) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Snowflake className="mr-1 size-3" />
                    {t('membership.status.freeze')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action="/billing/freeze"
                    method="post"
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('membership.status.freeze_title', { name: `${member.first_name} ${member.last_name}` })}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('membership.status.freeze_description')}
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="freeze_reason">
                                    {t('membership.status.freeze_reason_label')}
                                </Label>
                                <select
                                    id="freeze_reason"
                                    name="freeze_reason"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    required
                                >
                                    <option value="">
                                        {t('membership.status.select_reason')}
                                    </option>
                                    <option value="Medical_Injury">
                                        {t('membership.status.medical')}
                                    </option>
                                    <option value="Travel">
                                        {t('membership.status.travel')}
                                    </option>
                                    <option value="Personal">
                                        {t('membership.status.personal')}
                                    </option>
                                </select>
                                <InputError
                                    message={errors.freeze_reason}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="scheduled_unfreeze_date">
                                    {t('membership.status.unfreeze_date')}
                                </Label>
                                <Input
                                    id="scheduled_unfreeze_date"
                                    type="date"
                                    name="scheduled_unfreeze_date"
                                    required
                                />
                                <InputError
                                    message={
                                        errors.scheduled_unfreeze_date
                                    }
                                />
                            </div>

                            <DialogFooter>
                                <Button disabled={processing}>
                                    {t('membership.status.freeze_button')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function UnfreezeForm({ memberId }: { memberId: number }) {
    const { t } = useTranslation();

    return (
        <Form
            action={`/billing/freeze/${memberId}/unfreeze`}
            method="post"
        >
            <Button
                type="submit"
                variant="outline"
                size="sm"
            >
                {t('membership.status.reactivate')}
            </Button>
        </Form>
    );
}

function CancelDialog({ member }: { member: Member }) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600"
                >
                    <XCircle className="mr-1 size-3" />
                    {t('membership.status.cancel')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action="/membership/status/cancel"
                    method="post"
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('membership.status.cancel_title', { name: `${member.first_name} ${member.last_name}` })}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('membership.status.cancel_description')}
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="effective_cancellation_date">
                                    {t('membership.status.cancel_date')}
                                </Label>
                                <Input
                                    id="effective_cancellation_date"
                                    type="date"
                                    name="effective_cancellation_date"
                                    required
                                />
                                <InputError
                                    message={
                                        errors.effective_cancellation_date
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cancellation_reason">
                                    {t('membership.status.cancel_reason')}
                                </Label>
                                <textarea
                                    id="cancellation_reason"
                                    name="cancellation_reason"
                                    rows={3}
                                    className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    placeholder={t('membership.status.cancel_placeholder')}
                                    required
                                />
                                <InputError
                                    message={
                                        errors.cancellation_reason
                                    }
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    disabled={processing}
                                    variant="destructive"
                                >
                                    {t('membership.status.confirm_cancel')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function ModifyDialog({
    member,
    plans,
}: {
    member: Member;
    plans: Plan[];
}) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    {t('membership.status.modify')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action="/membership/status/modify"
                    method="post"
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {t('membership.status.modify_title', { name: `${member.first_name} ${member.last_name}` })}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('membership.status.modify_description')}
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="status">
                                    {t('membership.status.status')}
                                </Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    defaultValue={member.status}
                                    required
                                >
                                    <option value="Active">
                                        {t('membership.status.active')}
                                    </option>
                                    <option value="Expired">
                                        {t('membership.status.expired')}
                                    </option>
                                    <option value="Frozen">
                                        {t('membership.status.frozen')}
                                    </option>
                                    <option value="Cancelled">
                                        {t('membership.status.cancelled')}
                                    </option>
                                </select>
                                <InputError
                                    message={errors.status}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="current_plan_id">
                                    {t('membership.status.plan')}
                                </Label>
                                <select
                                    id="current_plan_id"
                                    name="current_plan_id"
                                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                >
                                    <option value="">
                                        {t('membership.status.no_plan')}
                                    </option>
                                    {plans.map((plan) => (
                                        <option
                                            key={plan.id}
                                            value={plan.id}
                                            selected={
                                                member.current_plan_id ===
                                                plan.id
                                            }
                                        >
                                            {plan.name} — $
                                            {plan.price}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={
                                        errors.current_plan_id
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">
                                        {t('membership.status.start_date')}
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        name="start_date"
                                        defaultValue={
                                            member.start_date ??
                                            ''
                                        }
                                    />
                                    <InputError
                                        message={
                                            errors.start_date
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">
                                        {t('membership.status.end_date')}
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        name="end_date"
                                        defaultValue={
                                            member.end_date ?? ''
                                        }
                                    />
                                    <InputError
                                        message={errors.end_date}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button disabled={processing}>
                                    {t('membership.status.save')}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

MembershipStatus.layout = {
    breadcrumbs: [
        {
            title: i18n.t('membership.status.title'),
            href: '/membership/status',
        },
    ],
};
