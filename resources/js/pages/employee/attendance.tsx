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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Clock, ClockArrowDown, ClockArrowUp, Search, Users } from 'lucide-react';

type StaffProfile = {
  id: number;
  user: { id: number; name: string; email: string } | null;
  role: { id: number; name: string; slug: string } | null;
  current_attendance_id: number | null;
  can_clock_in: boolean;
  can_clock_out: boolean;
  profile_photo_url: string | null;
};

export default function EmployeeAttendance({
  staff,
  search,
}: {
  staff: StaffProfile[];
  search: string | null;
}) {
  return (
    <>
      <Head title="Employee Attendance" />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title="Attendance & Clock In/Out"
          description="Search for a staff member to clock them in or out."
        />

        <Card>
          <CardContent className="pt-6">
            <Form
              action="/employee/attendance"
              method="get"
              className="flex items-end gap-4"
            >
              <div className="flex-1">
                <Label htmlFor="search">Search Staff</Label>
                <div className="relative mt-2">
                  <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="search"
                    name="search"
                    defaultValue={search ?? ''}
                    placeholder="Search by name or email..."
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
            {staff.length > 0
              ? `${staff.length} staff ${staff.length !== 1 ? 'members' : 'member'} found for "${search}"`
              : `No staff found for "${search}"`}
          </p>
        )}

        {staff.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {staff.map((profile) => (
              <StaffCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}

        {search && staff.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12">
              <Users className="text-muted-foreground size-12" />
              <p className="text-muted-foreground text-sm">
                No staff match your search.
              </p>
              <p className="text-muted-foreground text-xs">
                Try a different name or email.
              </p>
            </CardContent>
          </Card>
        )}

        {!search && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12">
              <Clock className="text-muted-foreground size-12" />
              <p className="text-muted-foreground text-sm">
                Search for a staff member to clock them in or out.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function StaffCard({ profile }: { profile: StaffProfile }) {
  const initials = profile.user
    ? profile.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-medium">
          {profile.profile_photo_url ? (
            <img src={profile.profile_photo_url} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">
            {profile.user?.name ?? '—'}
          </CardTitle>
          <p className="text-muted-foreground truncate text-xs">
            {profile.user?.email}
          </p>
        </div>
        {profile.current_attendance_id ? (
          <Badge variant="default" className="shrink-0 bg-emerald-600 hover:bg-emerald-600">
            <ClockArrowUp className="mr-1 size-3" />
            Clocked In
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            <ClockArrowDown className="mr-1 size-3" />
            Off Duty
          </Badge>
        )}
      </CardHeader>

      {profile.role && (
        <div className="px-6 pb-2">
          <Badge variant="outline" className="text-xs">{profile.role.name}</Badge>
        </div>
      )}

      <Separator />

      <CardFooter className="pt-4">
        {profile.can_clock_in && (
          <Form
            action="/employee/attendance/clock-in"
            method="post"
            className="w-full"
          >
            <input type="hidden" name="staff_profile_id" value={profile.id} />
            <Button type="submit" className="w-full" size="sm">
              <ClockArrowDown className="mr-1 size-4" />
              Clock In
            </Button>
          </Form>
        )}

        {profile.can_clock_out && (
          <Form
            action="/employee/attendance/clock-out"
            method="post"
            className="w-full"
          >
            <input type="hidden" name="staff_profile_id" value={profile.id} />
            <Button type="submit" variant="secondary" className="w-full" size="sm">
              <ClockArrowUp className="mr-1 size-4" />
              Clock Out
            </Button>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
}

EmployeeAttendance.layout = {
  breadcrumbs: [
    { title: 'Employee Management', href: '/employee/attendance' },
    { title: 'Attendance & Clock In/Out', href: '/employee/attendance' },
  ],
};
