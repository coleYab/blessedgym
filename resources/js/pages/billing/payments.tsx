import { Form, Head, usePage } from '@inertiajs/react';
import PaymentController from '@/actions/App/Http/Controllers/Billing/PaymentController';
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

type Invoice = {
  id: number;
  invoice_number: string;
  grand_total: string;
  status: string;
  member: { id: number; first_name: string; last_name: string } | null;
  plan: { id: number; name: string } | null;
};

type Member = { id: number; first_name: string; last_name: string; email: string; status: string };

type PaymentMethod = 'Cash' | 'Card' | 'Mobile_Money';

type Payment = {
  id: number;
  invoice: { invoice_number: string } | null;
  member: { first_name: string; last_name: string } | null;
  amount_paid: string;
  payment_timestamp: string;
  payment_method: PaymentMethod;
  transaction_metadata: {
    processor: string | null;
    gateway_reference_id: string | null;
    received_by_staff_id: number | null;
    last_four_digits: string | null;
  } | null;
};

type PageProps = {
  payments: Payment[];
  invoices: Invoice[];
  members: Member[];
};

const methodIcons: Record<PaymentMethod, string> = {
  Cash: '💵',
  Card: '💳',
  Mobile_Money: '📱',
};

export default function Payments() {
  const { payments, invoices, members } = usePage<PageProps>().props;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Mobile_Money');

  return (
    <>
      <Head title="Payment Collection" />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title="Payment Collection"
          description="Record payments via Cash, Card, or Mobile Money. Member status is updated automatically."
        />

        <Card>
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              {...PaymentController.store.form()}
              resetOnSuccess
              className="space-y-6"
            >
              {({ processing, errors, setData, data }) => (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="invoice_id">Invoice</Label>
                      <select
                        id="invoice_id"
                        name="invoice_id"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                      >
                        <option value="">Select invoice...</option>
                        {invoices.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.invoice_number} — ${Number(inv.grand_total).toFixed(2)}
                            {inv.member ? ` — ${inv.member.first_name} ${inv.member.last_name}` : ''}
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.invoice_id} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="member_id">Member</Label>
                      <select
                        id="member_id"
                        name="member_id"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                      >
                        <option value="">Select member...</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.first_name} {m.last_name} ({m.status})
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.member_id} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="amount_paid">Amount Paid</Label>
                      <Input id="amount_paid" name="amount_paid" type="number" step="0.01" min="0.01" required />
                      <InputError message={errors.amount_paid} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="payment_timestamp">Payment Date &amp; Time</Label>
                      <Input id="payment_timestamp" name="payment_timestamp" type="datetime-local" required />
                      <InputError message={errors.payment_timestamp} />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Payment Method</h3>

                    <div className="mb-4 flex gap-2">
                      {(['Cash', 'Card', 'Mobile_Money'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            setSelectedMethod(method);
                            setData('payment_method', method);
                          }}
                          className={`flex items-center gap-2 rounded-none border px-4 py-3 text-sm font-medium transition-colors ${
                            selectedMethod === method
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-input text-muted-foreground hover:border-ring hover:text-foreground'
                          }`}
                        >
                          <span className="text-lg">{methodIcons[method]}</span>
                          {method === 'Mobile_Money' ? 'Mobile Money' : method}
                        </button>
                      ))}
                      <input type="hidden" name="payment_method" value={selectedMethod} />
                      <InputError message={errors.payment_method} />
                    </div>

                    <div className="rounded-none border bg-muted/30 p-4">
                      {/* Cash — show staff reference field */}
                      {selectedMethod === 'Cash' && (
                        <div className="grid gap-2 sm:grid-cols-1">
                          <div className="grid gap-2">
                            <Label htmlFor="transaction_metadata_received_by_staff_id">
                              Received By (Staff ID)
                            </Label>
                            <Input
                              id="transaction_metadata_received_by_staff_id"
                              name="transaction_metadata[received_by_staff_id]"
                              type="number"
                              placeholder="Enter staff ID who received the cash"
                            />
                            <InputError message={errors['transaction_metadata.received_by_staff_id']} />
                          </div>
                        </div>
                      )}

                      {/* Card — show processor + last 4 digits */}
                      {selectedMethod === 'Card' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="transaction_metadata_processor">Processor</Label>
                            <select
                              id="transaction_metadata_processor"
                              name="transaction_metadata[processor]"
                              className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                            >
                              <option value="Stripe">Stripe</option>
                              <option value="PayPal">PayPal</option>
                              <option value="Square">Square</option>
                            </select>
                            <InputError message={errors['transaction_metadata.processor']} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="transaction_metadata_last_four_digits">
                              Card (Last 4 Digits)
                            </Label>
                            <Input
                              id="transaction_metadata_last_four_digits"
                              name="transaction_metadata[last_four_digits]"
                              placeholder="****-****-****-1234"
                              maxLength={4}
                            />
                            <InputError message={errors['transaction_metadata.last_four_digits']} />
                          </div>
                          <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="transaction_metadata_gateway_reference_id">
                              Gateway Reference ID
                            </Label>
                            <Input
                              id="transaction_metadata_gateway_reference_id"
                              name="transaction_metadata[gateway_reference_id]"
                              placeholder="e.g. TXN_STR_99283109"
                            />
                            <InputError message={errors['transaction_metadata.gateway_reference_id']} />
                          </div>
                        </div>
                      )}

                      {/* Mobile Money — show processor + phone reference */}
                      {selectedMethod === 'Mobile_Money' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="transaction_metadata_processor">Provider</Label>
                            <select
                              id="transaction_metadata_processor"
                              name="transaction_metadata[processor]"
                              className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                            >
                              <option value="Telebirr">Telebirr</option>
                              <option value="Chapa">Chapa</option>
                              <option value="M-Pesa">M-Pesa</option>
                              <option value="Airtel Money">Airtel Money</option>
                            </select>
                            <InputError message={errors['transaction_metadata.processor']} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="transaction_metadata_gateway_reference_id">
                              Transaction Reference
                            </Label>
                            <Input
                              id="transaction_metadata_gateway_reference_id"
                              name="transaction_metadata[gateway_reference_id]"
                              placeholder="e.g. TXN_MM_99283109X"
                            />
                            <InputError message={errors['transaction_metadata.gateway_reference_id']} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button disabled={processing}>
                      {processing ? 'Processing...' : 'Record Payment'}
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
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <span>{methodIcons[payment.payment_method] ?? '💳'}</span>
                        {payment.payment_method === 'Mobile_Money' ? 'Mobile Money' : payment.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.invoice?.invoice_number ?? '—'}
                    </TableCell>
                    <TableCell>
                      {payment.member
                        ? `${payment.member.first_name} ${payment.member.last_name}`
                        : '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(payment.amount_paid).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.payment_timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs text-muted-foreground">
                      {payment.transaction_metadata?.gateway_reference_id
                        ?? payment.transaction_metadata?.received_by_staff_id
                          ? `Staff #${payment.transaction_metadata.received_by_staff_id}`
                          : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={`/billing/payments/${payment.id}`}
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm('Delete this payment record?')) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="_method" value="delete" />
                        <Button type="submit" variant="ghost" size="sm">
                          Delete
                        </Button>
                      </form>
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

Payments.layout = {
  breadcrumbs: [
    { title: 'Billing & Pricing', href: '/billing/payments' },
    { title: 'Payment Collection', href: '/billing/payments' },
  ],
};
