<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Trainer', 'slug' => 'trainer', 'description' => 'Conducts training sessions and manages workout programs.'],
            ['name' => 'Receptionist', 'slug' => 'receptionist', 'description' => 'Handles front desk, check-ins, and member inquiries.'],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Oversees operations, staff, and business performance.'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
