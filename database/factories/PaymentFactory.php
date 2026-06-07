<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        $methods = ['Cash', 'Card', 'Mobile_Money'];
        $method = fake()->randomElement($methods);
        $plan = MembershipPlan::inRandomOrder()->first() ?? MembershipPlan::factory();

        $durationValue = fake()->numberBetween(1, 12);
        $durationUnit = fake()->randomElement(['days', 'weeks', 'months', 'years']);
        $requiredAmount = (float) $plan->base_price * $durationValue;

        $metadata = match ($method) {
            'Cash' => [
                'processor' => null,
                'gateway_reference_id' => null,
                'received_by_staff_id' => fake()->numberBetween(1, 10),
                'last_four_digits' => null,
            ],
            'Card' => [
                'processor' => 'Stripe',
                'gateway_reference_id' => 'TXN_'.strtoupper(fake()->bothify('???_##########')),
                'received_by_staff_id' => null,
                'last_four_digits' => fake()->numerify('####'),
            ],
            'Mobile_Money' => [
                'processor' => fake()->randomElement(['Telebirr', 'Chapa', 'M-Pesa']),
                'gateway_reference_id' => 'TXN_MM_'.strtoupper(fake()->bothify('##########X')),
                'received_by_staff_id' => null,
                'last_four_digits' => null,
            ],
        };

        return [
            'plan_id' => $plan,
            'member_id' => Member::factory(),
            'amount_paid' => $requiredAmount,
            'required_amount' => $requiredAmount,
            'duration_value' => $durationValue,
            'duration_unit' => $durationUnit,
            'payment_timestamp' => fake()->dateTimeThisMonth(),
            'payment_method' => $method,
            'transaction_metadata' => $metadata,
        ];
    }
}
