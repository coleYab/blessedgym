import { Form, Head, Link, usePage } from '@inertiajs/react';
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
import { useState } from 'react';

type PaymentRecord = {
  id: number;
  member: { id: number; first_name: string; last_name: string; email: string } | null;
  plan: { id: number; name: string } | null;
  amount_paid: string;
  required_amount: string;
  duration_value: number;
  duration_unit: string;
  payment_timestamp: string;
  payment_method: string;
  transaction_metadata: {
    processor: string | null;
    gateway_reference_id: string | null;
    received_by_staff_id: number | null;
    last_four_digits: string | null;
  } | null;
  refunded_at: string | null;
  refund_amount: string | null;
  refund_reason: string | null;
};

type Member = { id: number; first_name: string; last_name: string; email: string };

type PageProps = {
  payments: { data: PaymentRecord[]; current_page: number; last_page: number; total: number };
  members: Member[];
  filters: { member_id?: string; method?: string; date_from?: string; date_to?: string; refund_status?: string };
};

const methodIcons: Record<string, string> = {
  Cash: '💵',
  Card: '💳',
  Mobile_Money: '📱',
};

export default function PaymentHistory() {
  const { payments, members, filters } = usePage<PageProps>().props;

  return (
    <>
      <Head title="Payment History" />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title="Payment History"
          description="Chronological ledger of all payments with refund tracking and filters."
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              action="/billing/history"
              method="get"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="grid gap-2">
                  <Label htmlFor="member_id">Member</Label>
                  <select
                    id="member_id"
                    name="member_id"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    defaultValue={filters.member_id ?? ''}
                  >
                    <option value="">All members</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    name="method"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    defaultValue={filters.method ?? ''}
                  >
                    <option value="">All methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Mobile_Money">Mobile Money</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date_from">Date From</Label>
                  <Input
                    id="date_from"
                    name="date_from"
                    type="date"
                    defaultValue={filters.date_from ?? ''}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date_to">Date To</Label>
                  <Input
                    id="date_to"
                    name="date_to"
                    type="date"
                    defaultValue={filters.date_to ?? ''}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="refund_status">Refund Status</Label>
                  <select
                    id="refund_status"
                    name="refund_status"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    defaultValue={filters.refund_status ?? ''}
                  >
                    <option value="">All</option>
                    <option value="none">Not refunded</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit">Apply Filters</Button>
                <Link href="/billing/history">
                  <Button type="button" variant="outline">
                    Clear
                  </Button>
                </Link>
              </div>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Ledger
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({payments.total} records)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Refund</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                      No payments match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {payments.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap text-xs">
                      {new Date(payment.payment_timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.member
                        ? `${payment.member.first_name} ${payment.member.last_name}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {payment.plan?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 whitespace-nowrap">
                        <span>{methodIcons[payment.payment_method] ?? '💳'}</span>
                        {payment.payment_method === 'Mobile_Money' ? 'Mobile' : payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(payment.required_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(payment.amount_paid).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {payment.duration_value} {payment.duration_unit}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate font-mono text-xs text-muted-foreground">
                      {payment.transaction_metadata?.gateway_reference_id
                        ?? (payment.transaction_metadata?.received_by_staff_id
                          ? `Staff #${payment.transaction_metadata.received_by_staff_id}`
                          : '—')}
                    </TableCell>
                    <TableCell>
                      {payment.refunded_at ? (
                        <Badge variant="destructive" className="whitespace-nowrap">
                          Refunded ${Number(payment.refund_amount).toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!payment.refunded_at && (
                        <RefundDialog payment={payment} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {payments.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {payments.current_page} of {payments.last_page}
                </p>
                <div className="flex gap-2">
                  {payments.current_page > 1 && (
                    <Link
                      href={`/billing/history?page=${payments.current_page - 1}`}
                      preserveState
                    >
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                    </Link>
                  )}
                  {payments.current_page < payments.last_page && (
                    <Link
                      href={`/billing/history?page=${payments.current_page + 1}`}
                      preserveState
                    >
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RefundDialog({ payment }: { payment: PaymentRecord }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-sm rounded-none border bg-background p-6 shadow-lg">
          <h3 className="mb-2 text-sm font-medium">
            Refund Payment — ${Number(payment.amount_paid).toFixed(2)}
          </h3>
          <Form
            action={`/billing/payments/${payment.id}/refund`}
            method="post"
            resetOnSuccess
            className="space-y-4"
          >
            {({ processing, errors }) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="refund_amount">Refund Amount</Label>
                  <Input
                    id="refund_amount"
                    name="refund_amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(payment.amount_paid)}
                    defaultValue={payment.amount_paid}
                    required
                  />
                  <InputError message={errors.refund_amount} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="refund_reason">Reason</Label>
                  <textarea
                    id="refund_reason"
                    name="refund_reason"
                    rows={3}
                    className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    placeholder="Why is this being refunded?"
                    required
                  />
                  <InputError message={errors.refund_reason} />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="destructive" disabled={processing}>
                    {processing ? 'Processing...' : 'Issue Refund'}
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
      Refund
    </Button>
  );
}

PaymentHistory.layout = {
  breadcrumbs: [
    { title: 'Billing & Pricing', href: '/billing/history' },
    { title: 'Payment History', href: '/billing/history' },
  ],
};
