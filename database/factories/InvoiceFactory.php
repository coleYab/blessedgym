<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        $lineItems = [
            ['description' => 'Gold Annual Membership - Base', 'amount' => 500.00],
            ['description' => 'Registration Setup Fee', 'amount' => 25.00],
        ];
        $subtotal = collect($lineItems)->sum('amount');
        $tax = round($subtotal * 0.05, 2);
        $grandTotal = $subtotal + $tax;

        return [
            'invoice_number' => 'INV-'.now()->year.'-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'member_id' => Member::factory(),
            'plan_id' => MembershipPlan::factory(),
            'issued_date' => fake()->dateTimeThisMonth(),
            'due_date' => fn (array $attrs) => fake()->dateTimeBetween($attrs['issued_date'], '+30 days'),
            'line_items' => $lineItems,
            'subtotal' => $subtotal,
            'tax_total' => $tax,
            'discount_total' => 0,
            'grand_total' => $grandTotal,
            'status' => 'draft',
            'notes' => fake()->optional()->sentence(),
            'receipt_pdf_url' => null,
            'finalized_at' => null,
        ];
    }
}
