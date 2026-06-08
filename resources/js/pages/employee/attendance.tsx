import { Form, Head } from '@inertiajs/react';
import { Clock, ClockArrowDown, ClockArrowUp, Search, Users } from 'lucide-react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <>
      <Head title={t('employee.attendance.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('employee.attendance.title')}
          description={t('employee.attendance.description')}
        />

        <Card>
          <CardContent className="pt-6">
            <Form
              action="/employee/attendance"
              method="get"
              className="flex items-end gap-4"
            >
              <div className="flex-1">
                <Label htmlFor="search">{t('employee.attendance.search')}</Label>
                <div className="relative mt-2">
                  <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="search"
                    name="search"
                    defaultValue={search ?? ''}
                    placeholder={t('employee.attendance.search_placeholder')}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit">{t('employee.attendance.search_btn')}</Button>
            </Form>
          </CardContent>
        </Card>

        {search && (
          <p className="text-sm text-muted-foreground">
            {staff.length > 0
              ? t('employee.attendance.found', { count: staff.length, search })
              : t('employee.attendance.not_found', { search })}
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
                {t('employee.attendance.no_match')}
              </p>
              <p className="text-muted-foreground text-xs">
                {t('employee.attendance.try_different')}
              </p>
            </CardContent>
          </Card>
        )}

        {!search && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12">
              <Clock className="text-muted-foreground size-12" />
              <p className="text-muted-foreground text-sm">
                {t('employee.attendance.prompt')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function StaffCard({ profile }: { profile: StaffProfile }) {
  const { t } = useTranslation();
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
            {t('employee.attendance.clocked_in')}
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0">
            <ClockArrowDown className="mr-1 size-3" />
            {t('employee.attendance.off_duty')}
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
              {t('employee.attendance.clock_in')}
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
              {t('employee.attendance.clock_out')}
            </Button>
          </Form>
        )}
      </CardFooter>
    </Card>
  );
}

EmployeeAttendance.layout = {
  breadcrumbs: [
    { title: i18n.t('employee.attendance.breadcrumb_management'), href: '/employee/attendance' },
    { title: i18n.t('employee.attendance.title'), href: '/employee/attendance' },
  ],
};
