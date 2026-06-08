import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useState } from 'react';
import InvoiceController from '@/actions/App/Http/Controllers/Billing/InvoiceController';
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

type LineItem = { description: string; amount: number };

type Invoice = {
  id: number;
  invoice_number: string;
  member: { id: number; first_name: string; last_name: string; email: string } | null;
  plan: { id: number; name: string } | null;
  issued_date: string;
  due_date: string;
  line_items: LineItem[];
  subtotal: string;
  tax_total: string;
  discount_total: string;
  grand_total: string;
  status: string;
  notes: string | null;
  receipt_pdf_url: string | null;
  finalized_at: string | null;
};

type Member = { id: number; first_name: string; last_name: string; email: string };
type Plan = { id: number; name: string; base_price: string; currency: string };

type PageProps = {
  invoices: Invoice[];
  members: Member[];
  plans: Plan[];
  nextInvoiceNumber: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    draft: { label: 'Draft', variant: 'secondary' },
    finalized: { label: 'Finalized', variant: 'default' },
    paid: { label: i18n.t('billing.invoices.paid'), variant: 'outline' },
    void: { label: 'Void', variant: 'destructive' },
  };

  return map[status] ?? { label: status, variant: 'outline' as const };
};

export default function Invoices() {
  const { t } = useTranslation();
  const { invoices, members, plans } = usePage<PageProps>().props;
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', amount: 0 },
  ]);

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Head title={t('billing.invoices.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('billing.invoices.title')}
          description={t('billing.invoices.description')}
        />

        <Card>
          <CardHeader>
            <CardTitle>New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              {...InvoiceController.store.form()}
              resetOnSuccess
              className="space-y-6"
            >
              {({ processing, errors }) => (
                <>
                  <div>
                    <h3 className="mb-4 text-sm font-medium">Invoice Info</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor="invoice_number">Invoice Number</Label>
                        <Input id="invoice_number" name="invoice_number" readOnly className="bg-muted" />
                        <InputError message={errors.invoice_number} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="issued_date">Issued Date</Label>
                        <Input id="issued_date" name="issued_date" type="date" required />
                        <InputError message={errors.issued_date} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input id="due_date" name="due_date" type="date" required />
                        <InputError message={errors.due_date} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Member &amp; Plan</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="member_id">{t('billing.invoices.member')}</Label>
                        <select
                          id="member_id"
                          name="member_id"
                          className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                          required
                        >
                          <option value="">Select member...</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.first_name} {m.last_name} ({m.email})
                            </option>
                          ))}
                        </select>
                        <InputError message={errors.member_id} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="plan_id">Plan (optional)</Label>
                        <select
                          id="plan_id"
                          name="plan_id"
                          className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        >
                          <option value="">No plan</option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.currency} {Number(p.base_price).toFixed(2)})
                            </option>
                          ))}
                        </select>
                        <InputError message={errors.plan_id} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-medium">Line Items</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                        + Add Item
                      </Button>
                    </div>

                    {lineItems.map((_, index) => (
                      <div key={index} className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                        <div className="grid gap-1">
                          <Label htmlFor={`line_items_${index}_description`} className={index > 0 ? 'sr-only' : ''}>
                            Description
                          </Label>
                          <Input
                            id={`line_items_${index}_description`}
                            name={`line_items[${index}][description]`}
                            placeholder="e.g. Gold Annual Membership"
                            required
                          />
                          <InputError message={errors[`line_items.${index}.description`]} />
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor={`line_items_${index}_amount`} className={index > 0 ? 'sr-only' : ''}>
                            {t('billing.invoices.amount')}
                          </Label>
                          <Input
                            id={`line_items_${index}_amount`}
                            name={`line_items[${index}][amount]`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-32"
                            required
                          />
                          <InputError message={errors[`line_items.${index}.amount`]} />
                        </div>
                        {lineItems.length > 1 && (
                          <div className="flex items-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    <p className="mt-1 text-xs text-muted-foreground">
                      Subtotal, tax, discount, and grand total will be calculated on the server.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subtotal">Subtotal</Label>
                      <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" required />
                      <InputError message={errors.subtotal} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tax_total">Tax Total</Label>
                      <Input id="tax_total" name="tax_total" type="number" step="0.01" min="0" required />
                      <InputError message={errors.tax_total} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="discount_total">Discount Total</Label>
                      <Input id="discount_total" name="discount_total" type="number" step="0.01" min="0" required />
                      <InputError message={errors.discount_total} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="grand_total">Grand Total</Label>
                      <Input id="grand_total" name="grand_total" type="number" step="0.01" min="0" required />
                      <InputError message={errors.grand_total} />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                      />
                      <InputError message={errors.notes} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">{t('billing.invoices.status')}</Label>
                      <select
                        id="status"
                        name="status"
                        className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        required
                      >
                        <option value="draft">Draft (editable)</option>
                        <option value="finalized">Finalized (immutable)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Finalized invoices cannot be edited or deleted.
                      </p>
                      <InputError message={errors.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button disabled={processing}>
                      {processing ? t('billing.invoices.generate') : t('billing.invoices.generate')}
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
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.invoices.invoice')}</TableHead>
                  <TableHead>{t('billing.invoices.member')}</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>{t('billing.invoices.status')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      {t('billing.invoices.no_invoices')}
                    </TableCell>
                  </TableRow>
                )}
                {invoices.map((inv) => {
                  const badge = statusBadge(inv.status);

                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {inv.invoice_number}
                      </TableCell>
                      <TableCell>
                        {inv.member
                          ? `${inv.member.first_name} ${inv.member.last_name}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {new Date(inv.issued_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(inv.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(inv.grand_total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/billing/invoices/${inv.id}/pdf`}
                            className="inline-flex items-center justify-center rounded-none px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
                          >
                            PDF
                          </Link>
                          {inv.status === 'draft' && (
                            <>
                              <form
                                action={`/billing/invoices/${inv.id}/finalize`}
                                method="post"
                                className="inline"
                                onSubmit={(e) => {
                                  if (!confirm('Finalize this invoice? It will become immutable.')) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-none px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-accent"
                                >
                                  Finalize
                                </button>
                              </form>
                              <form
                                action={`/billing/invoices/${inv.id}`}
                                method="post"
                                className="inline"
                                onSubmit={(e) => {
                                  if (!confirm('Delete this draft invoice?')) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <input type="hidden" name="_method" value="delete" />
                                <button
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-none px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-accent"
                                >
                                  Delete
                                </button>
                              </form>
                            </>
                          )}
                        </div>
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

Invoices.layout = {
  breadcrumbs: [
    { title: i18n.t('billing.billing'), href: '/billing/invoices' },
    { title: i18n.t('billing.invoices.title'), href: '/billing/invoices' },
  ],
};
