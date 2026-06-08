import { Form, Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type FreezeRecord = {
  id: number;
  member: { id: number; first_name: string; last_name: string; email: string; status: string } | null;
  freeze_initiated_at: string;
  scheduled_unfreeze_date: string;
  actual_unfreeze_timestamp: string | null;
  total_days_paused: number;
  freeze_reason: string;
  authorized_by_staff_id: number | null;
};

type Member = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  end_date: string | null;
};

type PageProps = {
  freezes: FreezeRecord[];
  members: Member[];
  maxFreezeDays: number;
};

const reasonLabels: Record<string, string> = {
  Medical_Injury: 'Medical / Injury',
  Travel: 'Travel',
  Personal: 'Personal',
};

export default function Freeze() {
  const { t } = useTranslation();
  const { freezes, members, maxFreezeDays } = usePage<PageProps>().props;

  const activeMember = members.find((m) => m.status === 'Active');

  return (
    <>
      <Head title={t('billing.freeze.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('billing.freeze.title')}
          description={t('billing.freeze.description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Max Freeze Days / Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{maxFreezeDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Freezes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {freezes.filter((f) => !f.actual_unfreeze_timestamp).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Freezes Recorded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{freezes.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Freeze</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              action="/billing/freeze"
              method="post"
              resetOnSuccess
              className="space-y-6"
            >
              {({ processing, errors }) => (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="member_id">{t('billing.freeze.member')}</Label>
                      <select
                        id="member_id"
                        name="member_id"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                      >
                        <option value="">Select member...</option>
                        {members
                          .filter((m) => m.status === 'Active')
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.first_name} {m.last_name} ({m.email})
                            </option>
                          ))}
                      </select>
                      <InputError message={errors.member_id} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="freeze_reason">{t('billing.freeze.reason')}</Label>
                      <select
                        id="freeze_reason"
                        name="freeze_reason"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                      >
                        <option value="">Select reason...</option>
                        <option value="Medical_Injury">Medical / Injury</option>
                        <option value="Travel">Travel</option>
                        <option value="Personal">Personal</option>
                      </select>
                      <InputError message={errors.freeze_reason} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="scheduled_unfreeze_date">
                        {t('billing.freeze.period')}
                      </Label>
                      <Input
                        id="scheduled_unfreeze_date"
                        name="scheduled_unfreeze_date"
                        type="date"
                        required
                      />
                      <InputError message={errors.scheduled_unfreeze_date} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button disabled={processing}>
                      {processing ? 'Processing...' : 'Freeze Membership'}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Freeze History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.freeze.member')}</TableHead>
                  <TableHead>{t('billing.freeze.reason')}</TableHead>
                  <TableHead>Frozen On</TableHead>
                  <TableHead>{t('billing.freeze.period')}</TableHead>
                  <TableHead>Actual Unfreeze</TableHead>
                  <TableHead>Days Paused</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {freezes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      {t('billing.freeze.no_frozen')}
                    </TableCell>
                  </TableRow>
                )}
                {freezes.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.member
                        ? `${record.member.first_name} ${record.member.last_name}`
                        : '—'}
                      {record.member && (
                        <div className="text-xs text-muted-foreground">
                          <Badge
                            variant={
                              record.member.status === 'Active'
                                ? 'default'
                                : record.member.status === 'Frozen'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="ml-1"
                          >
                            {record.member.status}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{reasonLabels[record.freeze_reason] ?? record.freeze_reason}</TableCell>
                    <TableCell>{new Date(record.freeze_initiated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Date(record.scheduled_unfreeze_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {record.actual_unfreeze_timestamp ? (
                        new Date(record.actual_unfreeze_timestamp).toLocaleDateString()
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{record.total_days_paused}d</TableCell>
                    <TableCell className="font-mono text-xs">
                      {record.authorized_by_staff_id ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!record.actual_unfreeze_timestamp && record.member && (
                        <Form
                          action={`/billing/freeze/${record.member.id}/unfreeze`}
                          method="post"
                          className="inline"
                        >
                          <Button type="submit" variant="outline" size="sm">
                            {t('billing.freeze.unfreeze')}
                          </Button>
                        </Form>
                      )}
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

Freeze.layout = {
  breadcrumbs: [
    { title: i18n.t('billing.billing'), href: '/billing/freeze' },
    { title: i18n.t('billing.freeze.title'), href: '/billing/freeze' },
  ],
};
