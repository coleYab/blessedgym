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
            'duration_days' => 30,
            'price' => 49.99,
            'is_active' => true,
        ]);

        MembershipPlan::create([
            'name' => 'Quarterly Standard',
            'description' => 'Three-month plan with a small discount.',
            'duration_days' => 90,
            'price' => 129.99,
            'is_active' => true,
        ]);
    }
}
