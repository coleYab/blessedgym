import { Form, Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useState, useMemo } from 'react';
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

type Plan = {
  id: number;
  name: string;
  base_price: number;
  duration_value: number;
  duration_unit: string;
  currency: string;
};

type Member = { id: number; first_name: string; last_name: string; email: string; status: string };

type PaymentMethod = 'Cash' | 'Card' | 'Mobile_Money';

type Payment = {
  id: number;
  plan: { name: string } | null;
  member: { first_name: string; last_name: string } | null;
  amount_paid: string;
  required_amount: string;
  duration_value: number;
  duration_unit: string;
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
  plans: Plan[];
  members: Member[];
};

const methodIcons: Record<PaymentMethod, string> = {
  Cash: '💵',
  Card: '💳',
  Mobile_Money: '📱',
};

const durationUnitLabels: Record<string, string> = {
  days: 'Day(s)',
  weeks: 'Week(s)',
  months: 'Month(s)',
  years: 'Year(s)',
};

export default function Payments() {
  const { t } = useTranslation();
  const { payments, plans, members } = usePage<PageProps>().props;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Mobile_Money');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [durationValue, setDurationValue] = useState<string>('1');

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === Number(selectedPlanId)),
    [selectedPlanId, plans],
  );

  const calculatedRequired = useMemo(() => {
    if (!selectedPlan || !durationValue) {
return 0;
}

    const multiplier = Number(durationValue) / selectedPlan.duration_value;

    return selectedPlan.base_price * multiplier;
  }, [selectedPlan, durationValue]);

  return (
    <>
      <Head title={t('billing.payments.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('billing.payments.title')}
          description={t('billing.payments.description')}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t('billing.payments.record')}</CardTitle>
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
                      <Label htmlFor="member_id">{t('billing.payments.member')}</Label>
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

                    <div className="grid gap-2">
                      <Label htmlFor="plan_id">Plan</Label>
                      <select
                        id="plan_id"
                        name="plan_id"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                        value={selectedPlanId}
                        onChange={(e) => {
                          setSelectedPlanId(e.target.value);
                          setData('plan_id', e.target.value);
                        }}
                      >
                        <option value="">Select plan...</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.base_price.toFixed(2)} / {p.duration_value} {durationUnitLabels[p.duration_unit] ?? p.duration_unit})
                          </option>
                        ))}
                      </select>
                      <InputError message={errors.plan_id} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="duration_value">Duration</Label>
                      <div className="flex gap-2">
                        <Input
                          id="duration_value"
                          name="duration_value"
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={durationValue}
                          onChange={(e) => {
                            setDurationValue(e.target.value);
                            setData('duration_value', e.target.value);
                          }}
                          className="flex-1"
                        />
                        {selectedPlan && (
                          <span className="border-input flex h-9 items-center rounded-none border bg-muted px-3 text-sm text-muted-foreground">
                            {durationUnitLabels[selectedPlan.duration_unit] ?? selectedPlan.duration_unit}
                          </span>
                        )}
                      </div>
                      {selectedPlan && (
                        <p className="text-xs text-muted-foreground">
                          Each {selectedPlan.duration_value} {durationUnitLabels[selectedPlan.duration_unit]?.toLowerCase() ?? selectedPlan.duration_unit} = ${selectedPlan.base_price.toFixed(2)}
                        </p>
                      )}
                      <input type="hidden" name="duration_unit" value={selectedPlan?.duration_unit ?? 'months'} />
                      <InputError message={errors.duration_value} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="required_amount">Required Amount</Label>
                      <div className="relative">
                        <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                          ${calculatedRequired.toFixed(2)}
                        </span>
                        <input
                          type="hidden"
                          name="required_amount"
                          value={calculatedRequired.toFixed(2)}
                        />
                        <div className="border-input flex h-9 w-full min-w-0 rounded-none border bg-muted px-3 py-1 text-base shadow-xs md:text-sm" />
                      </div>
                      <InputError message={errors.required_amount} />
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

                  {calculatedRequired > 0 && (
                    <div className="rounded-none border bg-muted/30 p-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Required: </span>
                        <span className="font-semibold">${calculatedRequired.toFixed(2)}</span>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <span className="text-muted-foreground">Paid: </span>
                        <span
                          className={`font-semibold ${Number(data.amount_paid ?? 0) >= calculatedRequired ? 'text-emerald-600' : 'text-amber-600'}`}
                        >
                          ${Number(data.amount_paid ?? 0).toFixed(2)}
                        </span>
                        {Number(data.amount_paid ?? 0) >= calculatedRequired && (
                          <span className="ml-2 text-xs text-emerald-600">✓ Fully paid</span>
                        )}
                        {Number(data.amount_paid ?? 0) < calculatedRequired && Number(data.amount_paid ?? 0) > 0 && (
                          <span className="ml-2 text-xs text-amber-600">
                            ${(calculatedRequired - Number(data.amount_paid ?? 0)).toFixed(2)} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <Button disabled={processing}>
                      {processing ? t('billing.payments.record') : t('billing.payments.record')}
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
                  <TableHead>{t('billing.payments.method')}</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>{t('billing.payments.member')}</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>{t('billing.payments.date')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                      {t('billing.payments.no_payments')}
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
                    <TableCell className="text-xs">
                      {payment.plan?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {payment.member
                        ? `${payment.member.first_name} ${payment.member.last_name}`
                        : '—'}
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
                    <TableCell>
                      {new Date(payment.payment_timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={`/billing/payments/${payment.id}`}
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm('Delete this payment record?')) {
e.preventDefault();
}
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
    { title: i18n.t('billing.billing'), href: '/billing/payments' },
    { title: i18n.t('billing.payments.title'), href: '/billing/payments' },
  ],
};
