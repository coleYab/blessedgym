import { Form, Head, Link } from '@inertiajs/react';
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
import {
    CalendarDays,
    CreditCard,
    Search,
    Snowflake,
    Users,
    XCircle,
} from 'lucide-react';

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
    return (
        <>
            <Head title="Membership Status" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Membership Status"
                    description="Search and manage member subscription statuses."
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
                                    Search Members
                                </Label>
                                <div className="relative mt-2">
                                    <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                                    <Input
                                        id="search"
                                        name="search"
                                        defaultValue={search ?? ''}
                                        placeholder="Search by name, email, or phone..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <Button type="submit">Search</Button>
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
                                        ? 'All'
                                        : option}
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
                                No members match your search.
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
                    <span className="text-muted-foreground">Phone</span>
                    <span>{member.phone_number}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="size-3.5" />
                        Plan
                    </span>
                    <span>
                        {member.current_plan?.name ?? 'No plan'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        Period
                    </span>
                    <span>
                        {member.start_date && member.end_date
                            ? `${member.start_date} — ${member.end_date}`
                            : 'Not set'}
                    </span>
                </div>

                {member.status === 'Frozen' && member.freeze_reason && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Snowflake className="size-3.5" />
                            Frozen
                        </span>
                        <span>
                            {member.freeze_reason}
                            {member.freeze_end_date
                                ? ` (until ${member.freeze_end_date})`
                                : ''}
                        </span>
                    </div>
                )}

                {member.status === 'Cancelled' && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <XCircle className="size-3.5" />
                            Cancelled
                        </span>
                        <span>
                            {member.effective_cancellation_date
                                ? `Effective ${member.effective_cancellation_date}`
                                : ''}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Currently in facility
                    </span>
                    <span>
                        {member.active_session ? 'Yes' : 'No'}
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
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Snowflake className="mr-1 size-3" />
                    Freeze
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <Form
                    action="/membership/status/freeze"
                    method="post"
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Freeze {member.first_name}{' '}
                                    {member.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                    Temporarily pause this membership.
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="freeze_reason">
                                    Freeze Reason
                                </Label>
                                <select
                                    id="freeze_reason"
                                    name="freeze_reason"
                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    required
                                >
                                    <option value="">
                                        Select reason...
                                    </option>
                                    <option value="Medical">
                                        Medical
                                    </option>
                                    <option value="Travel">
                                        Travel
                                    </option>
                                    <option value="Financial">
                                        Financial
                                    </option>
                                    <option value="Injury">
                                        Injury
                                    </option>
                                </select>
                                <InputError
                                    message={errors.freeze_reason}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="freeze_start_date">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="freeze_start_date"
                                        type="date"
                                        name="freeze_start_date"
                                        defaultValue={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.freeze_start_date
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="freeze_end_date">
                                        End Date
                                    </Label>
                                    <Input
                                        id="freeze_end_date"
                                        type="date"
                                        name="freeze_end_date"
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.freeze_end_date
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button disabled={processing}>
                                    Freeze Membership
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
    return (
        <Form
            action="/membership/status/unfreeze"
            method="post"
        >
            <input type="hidden" name="member_id" value={memberId} />
            <Button
                type="submit"
                variant="outline"
                size="sm"
            >
                Reactivate
            </Button>
        </Form>
    );
}

function CancelDialog({ member }: { member: Member }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600"
                >
                    <XCircle className="mr-1 size-3" />
                    Cancel
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
                                    Cancel{' '}
                                    {member.first_name}{' '}
                                    {member.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                    This will cancel the
                                    membership. Access will
                                    remain active until the
                                    effective cancellation date.
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="effective_cancellation_date">
                                    Effective Cancellation Date
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
                                    Reason for Cancellation
                                </Label>
                                <textarea
                                    id="cancellation_reason"
                                    name="cancellation_reason"
                                    rows={3}
                                    className="border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    placeholder="Tell us why..."
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
                                    Confirm Cancellation
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
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Modify Status
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
                                    Modify{' '}
                                    {member.first_name}{' '}
                                    {member.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                    Update membership status,
                                    plan, or dates.
                                </DialogDescription>
                            </DialogHeader>

                            <input
                                type="hidden"
                                name="member_id"
                                value={member.id}
                            />

                            <div className="grid gap-2">
                                <Label htmlFor="status">
                                    Status
                                </Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                    defaultValue={member.status}
                                    required
                                >
                                    <option value="Active">
                                        Active
                                    </option>
                                    <option value="Expired">
                                        Expired
                                    </option>
                                    <option value="Frozen">
                                        Frozen
                                    </option>
                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </select>
                                <InputError
                                    message={errors.status}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="current_plan_id">
                                    Plan
                                </Label>
                                <select
                                    id="current_plan_id"
                                    name="current_plan_id"
                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                >
                                    <option value="">
                                        No plan
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
                                        Start Date
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
                                        End Date
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
                                    Save Changes
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
            title: 'Membership Status',
            href: '/membership/status',
        },
    ],
};
