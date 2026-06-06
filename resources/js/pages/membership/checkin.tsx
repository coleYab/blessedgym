import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ImageIcon, Search, UserCheck, UserX, Users } from 'lucide-react';

type Member = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    current_session_id: number | null;
    today_sessions_count: number;
    can_checkin: boolean;
    can_checkout: boolean;
    profile_photo_url: string | null;
    id_document_url: string | null;
};

export default function MemberCheckin({
    members,
    search,
}: {
    members: Member[];
    search: string | null;
}) {
    return (
        <>
            <Head title="Member Check-in" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Member Check-in"
                    description="Search for a member to record their entry or exit."
                />

                <Card>
                    <CardContent className="pt-6">
                        <Form
                            action="/membership/checkin"
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

                {search && (
                    <p className="text-sm text-muted-foreground">
                        {members.length > 0
                            ? `${members.length} member${members.length !== 1 ? 's' : ''} found for "${search}"`
                            : `No members found for "${search}"`}
                    </p>
                )}

                {members.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {members.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
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
                            <p className="text-muted-foreground text-xs">
                                Try a different name, email, or phone number.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

function MemberCard({ member }: { member: Member }) {
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
                {member.current_session_id ? (
                    <Badge variant="default" className="shrink-0 bg-emerald-600 hover:bg-emerald-600">
                        <UserCheck className="mr-1 size-3" />
                        In
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="shrink-0">
                        <UserX className="mr-1 size-3" />
                        Out
                    </Badge>
                )}
            </CardHeader>

            {(member.profile_photo_url || member.id_document_url) && (
                <div className="px-6 pb-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <ImageIcon className="mr-1 size-3" />
                                Show Photo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    {member.first_name} {member.last_name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-4">
                                {member.profile_photo_url ? (
                                    <div>
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            Profile Photo
                                        </p>
                                        <img
                                            src={member.profile_photo_url}
                                            alt={`${member.first_name} ${member.last_name}`}
                                            className="w-full rounded-lg border object-cover"
                                        />
                                    </div>
                                ) : null}
                                {member.id_document_url ? (
                                    <div>
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            ID Document
                                        </p>
                                        <img
                                            src={member.id_document_url}
                                            alt="ID Document"
                                            className="w-full rounded-lg border object-cover"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <Separator />

            <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{member.phone_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Today's Sessions
                    </span>
                    <span>{member.today_sessions_count} / 2</span>
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                {member.can_checkin && (
                    <Form
                        action="/membership/checkin/check-in"
                        method="post"
                        className="w-full"
                    >
                        <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            size="sm"
                        >
                            Check In
                        </Button>
                    </Form>
                )}

                {member.can_checkout && (
                    <Form
                        action="/membership/checkin/check-out"
                        method="post"
                        className="w-full"
                    >
                        <input
                            type="hidden"
                            name="member_id"
                            value={member.id}
                        />
                        <Button
                            type="submit"
                            variant="secondary"
                            className="w-full"
                            size="sm"
                        >
                            Check Out
                        </Button>
                    </Form>
                )}

                {!member.can_checkin && !member.can_checkout && (
                    <p className="text-muted-foreground w-full text-center text-xs">
                        Max sessions reached for today
                    </p>
                )}
            </CardFooter>
        </Card>
    );
}

MemberCheckin.layout = {
    breadcrumbs: [
        {
            title: 'Member Check-in',
            href: '/membership/checkin',
        },
    ],
};
