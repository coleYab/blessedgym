import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type LedgerEntry = {
  id: number;
  member: { id: number; first_name: string; last_name: string; email: string; status: string } | null;
  total_invoiced_amount: string;
  total_paid_amount: string;
  outstanding_balance: string;
  days_overdue: number;
  payment_urgency_status: 'Settled' | 'Overdue_Grace_Period' | 'Suspended_Non_Payment';
  last_status_update: string | null;
};

type PageProps = {
  ledger: LedgerEntry[];
  gracePeriodDays: number;
};

const urgencyConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: string }
> = {
  Settled: { label: i18n.t('billing.balances.paid'), variant: 'outline', icon: '✓' },
  Overdue_Grace_Period: { label: i18n.t('billing.balances.overdue'), variant: 'secondary', icon: '⚠' },
  Suspended_Non_Payment: { label: 'Suspended', variant: 'destructive', icon: '✕' },
};

export default function Balances() {
  const { t } = useTranslation();
  const { ledger, gracePeriodDays } = usePage<PageProps>().props;

  const totalOutstanding = ledger.reduce(
    (sum, entry) => sum + Number(entry.outstanding_balance),
    0,
  );

  const overdueCount = ledger.filter(
    (e) => e.payment_urgency_status !== 'Settled',
  ).length;

  return (
    <>
      <Head title={t('billing.balances.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('billing.balances.title')}
          description={t('billing.balances.description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalOutstanding.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{overdueCount}</p>
              <p className="text-xs text-muted-foreground">
                {gracePeriodDays}-day grace period before suspension
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{ledger.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <form action="/billing/balances/recalculate" method="post">
            <Button type="submit" variant="outline">
              Recalculate All
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Debt Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.balances.member')}</TableHead>
                  <TableHead>{t('billing.balances.status')}</TableHead>
                  <TableHead>Invoiced</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      {t('billing.balances.no_balances')}
                    </TableCell>
                  </TableRow>
                )}
                {ledger.map((entry) => {
                  const cfg = urgencyConfig[entry.payment_urgency_status] ?? urgencyConfig.Settled;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.member
                          ? `${entry.member.first_name} ${entry.member.last_name}`
                          : '—'}
                        {entry.member && (
                          <div className="text-xs text-muted-foreground">
                            {entry.member.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.member?.status === 'Active'
                              ? 'default'
                              : entry.member?.status === 'Expired'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {entry.member?.status ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>${Number(entry.total_invoiced_amount).toFixed(2)}</TableCell>
                      <TableCell>${Number(entry.total_paid_amount).toFixed(2)}</TableCell>
                      <TableCell
                        className={`font-medium ${
                          Number(entry.outstanding_balance) > 0
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        ${Number(entry.outstanding_balance).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {entry.days_overdue > 0 ? (
                          <span className="font-medium text-rose-600">
                            {entry.days_overdue}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1">
                          <span>{cfg.icon}</span>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.member && (
                          <form
                            action={`/billing/balances/recalculate/${entry.member.id}`}
                            method="post"
                            className="inline"
                          >
                            <Button type="submit" variant="ghost" size="sm">
                              Refresh
                            </Button>
                          </form>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Balances.layout = {
  breadcrumbs: [
    { title: i18n.t('billing.billing'), href: '/billing/balances' },
    { title: i18n.t('billing.balances.title'), href: '/billing/balances' },
  ],
};
