<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        $methods = ['Cash', 'Card', 'Mobile_Money'];
        $method = fake()->randomElement($methods);

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
            'invoice_id' => Invoice::factory(),
            'member_id' => Member::factory(),
            'amount_paid' => fake()->randomFloat(2, 10, 1000),
            'payment_timestamp' => fake()->dateTimeThisMonth(),
            'payment_method' => $method,
            'transaction_metadata' => $metadata,
        ];
    }
}
