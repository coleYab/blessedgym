import { Form, Head, usePage } from '@inertiajs/react';
import PlanController from '@/actions/App/Http/Controllers/Billing/PlanController';
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

type BenefitFlags = {
  has_pool_access: boolean;
  has_sauna_access: boolean;
  max_visits_per_month: number | null;
  allowed_hours: { start: string; end: string } | null;
};

type Plan = {
  id: number;
  name: string;
  description: string | null;
  base_price: string;
  signup_fee: string | null;
  currency: string;
  tax_percentage: string | null;
  duration_value: number;
  duration_unit: string;
  benefits: BenefitFlags | null;
  is_active: boolean;
  member_count: number;
};

type PageProps = {
  plans: Plan[];
};

export default function Plans() {
  const { plans } = usePage<PageProps>().props;

  return (
    <>
      <Head title="Flexible Plan Creation" />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title="Flexible Plan Creation"
          description="Create and manage membership plans with custom duration, pricing, and benefit flags."
        />

        <Card>
          <CardHeader>
            <CardTitle>New Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              {...PlanController.store.form()}
              className="space-y-6"
            >
              {({ processing, errors }) => (
                <>
                  <div>
                    <h3 className="mb-4 text-sm font-medium">Plan Details</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input id="name" name="name" required />
                        <InputError message={errors.name} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" />
                        <InputError message={errors.description} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Pricing</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="grid gap-2">
                        <Label htmlFor="base_price">Base Price</Label>
                        <Input id="base_price" name="base_price" type="number" step="0.01" min="0" required />
                        <InputError message={errors.base_price} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="signup_fee">Signup Fee</Label>
                        <Input id="signup_fee" name="signup_fee" type="number" step="0.01" min="0" />
                        <InputError message={errors.signup_fee} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          name="currency"
                          className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                          required
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <InputError message={errors.currency} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tax_percentage">Tax (%)</Label>
                        <Input id="tax_percentage" name="tax_percentage" type="number" step="0.01" min="0" max="100" />
                        <InputError message={errors.tax_percentage} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Duration</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="duration_value">Duration Value</Label>
                        <Input id="duration_value" name="duration_value" type="number" min="1" required />
                        <InputError message={errors.duration_value} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="duration_unit">Duration Unit</Label>
                        <select
                          id="duration_unit"
                          name="duration_unit"
                          className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                          required
                        >
                          <option value="">Select unit...</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                        <InputError message={errors.duration_unit} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Benefits & Restrictions</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="hidden"
                          name="benefits[has_pool_access]"
                          value="0"
                        />
                        <input
                          id="benefits_has_pool_access"
                          type="checkbox"
                          name="benefits[has_pool_access]"
                          value="1"
                          className="border-input size-4 shrink-0 rounded-none border shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        />
                        <Label htmlFor="benefits_has_pool_access" className="!leading-none">
                          Pool Access
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="hidden"
                          name="benefits[has_sauna_access]"
                          value="0"
                        />
                        <input
                          id="benefits_has_sauna_access"
                          type="checkbox"
                          name="benefits[has_sauna_access]"
                          value="1"
                          className="border-input size-4 shrink-0 rounded-none border shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        />
                        <Label htmlFor="benefits_has_sauna_access" className="!leading-none">
                          Sauna Access
                        </Label>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="benefits_max_visits_per_month">Max Visits / Month</Label>
                        <Input id="benefits_max_visits_per_month" name="benefits[max_visits_per_month]" type="number" min="1" placeholder="Leave empty for unlimited" />
                        <InputError message={errors['benefits.max_visits_per_month']} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="benefits_allowed_hours_start">Allowed Start Hour</Label>
                        <Input id="benefits_allowed_hours_start" name="benefits[allowed_hours][start]" type="time" step="1" />
                        <InputError message={errors['benefits.allowed_hours.start']} />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="benefits_allowed_hours_end">Allowed End Hour</Label>
                        <Input id="benefits_allowed_hours_end" name="benefits[allowed_hours][end]" type="time" step="1" />
                        <InputError message={errors['benefits.allowed_hours.end']} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <input
                      type="hidden"
                      name="is_active"
                      value="0"
                    />
                    <input
                      id="is_active"
                      type="checkbox"
                      name="is_active"
                      value="1"
                      defaultChecked
                      className="border-input size-4 shrink-0 rounded-none border shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                    <Label htmlFor="is_active" className="!leading-none">
                      Active (available for registration)
                    </Label>
                    <InputError message={errors.is_active} />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button disabled={processing}>
                      {processing ? 'Creating...' : 'Create Plan'}
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
            <CardTitle>Existing Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Signup Fee</TableHead>
                  <TableHead>Benefits</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No plans created yet.
                    </TableCell>
                  </TableRow>
                )}
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.duration_value} {plan.duration_unit}</TableCell>
                    <TableCell>
                      {plan.currency} {Number(plan.base_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {plan.signup_fee ? `${plan.currency} ${Number(plan.signup_fee).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.benefits?.has_pool_access && (
                          <Badge variant="outline">Pool</Badge>
                        )}
                        {plan.benefits?.has_sauna_access && (
                          <Badge variant="outline">Sauna</Badge>
                        )}
                        {plan.benefits?.max_visits_per_month && (
                          <Badge variant="outline">Max {plan.benefits.max_visits_per_month}/mo</Badge>
                        )}
                        {!plan.benefits?.has_pool_access && !plan.benefits?.has_sauna_access && !plan.benefits?.max_visits_per_month && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{plan.member_count}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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

Plans.layout = {
  breadcrumbs: [
    { title: 'Billing & Pricing', href: '/billing/plans' },
    { title: 'Flexible Plan Creation', href: '/billing/plans' },
  ],
};
