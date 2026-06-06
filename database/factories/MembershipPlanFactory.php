<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MembershipPlanFactory extends Factory
{
    public function definition(): array
    {
        $units = ['days', 'weeks', 'months', 'years'];

        return [
            'name' => fake()->unique()->randomElement([
                'Basic Monthly',
                'Standard Monthly',
                'Premium Monthly',
                'Gold Annual',
                'Platinum Annual',
                'Student Plan',
                'Off-Peak Plan',
                'Family Plan',
            ]),
            'description' => fake()->sentence(),
            'base_price' => fake()->randomFloat(2, 10, 999),
            'signup_fee' => fake()->optional(0.7)->randomFloat(2, 0, 50),
            'currency' => 'USD',
            'tax_percentage' => fake()->optional(0.8)->randomFloat(2, 0, 15),
            'duration_value' => fake()->randomElement([1, 3, 6, 12]),
            'duration_unit' => fake()->randomElement($units),
            'benefits' => [
                'has_pool_access' => fake()->boolean(),
                'has_sauna_access' => fake()->boolean(),
                'max_visits_per_month' => fake()->optional(0.5)->numberBetween(10, 30),
                'allowed_hours' => [
                    'start' => '05:00:00',
                    'end' => '23:00:00',
                ],
            ],
            'is_active' => true,
        ];
    }
}
