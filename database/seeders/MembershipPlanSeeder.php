<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;

class MembershipPlanSeeder extends Seeder
{
    public function run(): void
    {
        MembershipPlan::create([
            'name' => 'Monthly Basic',
            'description' => 'Standard monthly membership with access to all basic facilities.',
            'base_price' => 49.99,
            'signup_fee' => 10.00,
            'currency' => 'USD',
            'tax_percentage' => 5.00,
            'duration_value' => 1,
            'duration_unit' => 'months',
            'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false],
            'is_active' => true,
        ]);

        MembershipPlan::create([
            'name' => 'Quarterly Standard',
            'description' => 'Three-month plan with a small discount.',
            'base_price' => 129.99,
            'signup_fee' => 15.00,
            'currency' => 'USD',
            'tax_percentage' => 5.00,
            'duration_value' => 3,
            'duration_unit' => 'months',
            'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false],
            'is_active' => true,
        ]);
    }
}
