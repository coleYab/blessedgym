<?php

namespace Database\Seeders;

use App\Models\CheckinLog;
use App\Models\DebtLedger;
use App\Models\EmployeeAttendanceLog;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipFreeze;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\Role;
use App\Models\StaffLeaveRequest;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BigDatasetSeeder extends Seeder
{
    private const USER_COUNT = 25;

    private const MEMBER_COUNT = 500;

    private const CHECKIN_COUNT_PER_MEMBER = 10;

    private const INVOICE_COUNT_PER_MEMBER = 2;

    private const EXPENSE_COUNT = 200;

    private const FREEZE_COUNT = 50;

    private const ATTENDANCE_LOG_COUNT_PER_STAFF = 20;

    private const LEAVE_REQUEST_COUNT_PER_STAFF = 2;

    public function run(): void
    {
        $this->command?->info('Seeding big dataset...');

        $this->seedRoles();
        $this->seedMembershipPlans();
        $users = $this->seedUsers();
        $staffProfiles = $this->seedStaffProfiles($users);
        $plans = MembershipPlan::all();
        $roles = Role::all();
        $members = $this->seedMembers($users, $plans);
        $this->seedCheckinLogs($members);
        $this->seedDebtLedger($members);
        $invoices = $this->seedInvoices($members, $plans);
        $this->seedPayments($plans, $members);
        $this->seedMembershipFreezes($members, $staffProfiles);
        $this->seedEmployeeAttendanceLogs($staffProfiles);
        $this->seedStaffLeaveRequests($staffProfiles);
        $this->seedExpenses();

        $this->command?->info('Big dataset seeding complete!');
    }

    private function seedRoles(): void
    {
        $roles = [
            ['name' => 'Trainer', 'slug' => 'trainer', 'description' => 'Conducts training sessions and manages workout programs.'],
            ['name' => 'Receptionist', 'slug' => 'receptionist', 'description' => 'Handles front desk, check-ins, and member inquiries.'],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Oversees operations, staff, and business performance.'],
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'System administrator with full access.'],
            ['name' => 'Cleaner', 'slug' => 'cleaner', 'description' => 'Maintains cleanliness and hygiene of the facility.'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }

        $this->command?->info('Seeded '.count($roles).' roles.');
    }

    private function seedMembershipPlans(): void
    {
        $plans = [
            [
                'name' => 'Monthly Basic',
                'description' => 'Access to gym floor and cardio area.',
                'base_price' => 29.99,
                'signup_fee' => 10.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false, 'max_visits_per_month' => null],
                'is_active' => true,
            ],
            [
                'name' => 'Monthly Premium',
                'description' => 'Full access including pool, sauna, and classes.',
                'base_price' => 59.99,
                'signup_fee' => 20.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => true, 'has_sauna_access' => true, 'max_visits_per_month' => null],
                'is_active' => true,
            ],
            [
                'name' => 'Quarterly Standard',
                'description' => 'Three-month plan with discounted rate.',
                'base_price' => 129.99,
                'signup_fee' => 15.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 3,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false, 'max_visits_per_month' => null],
                'is_active' => true,
            ],
            [
                'name' => 'Gold Annual',
                'description' => 'Best value annual membership with all perks.',
                'base_price' => 399.99,
                'signup_fee' => 0,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'years',
                'benefits' => ['has_pool_access' => true, 'has_sauna_access' => true, 'max_visits_per_month' => null],
                'is_active' => true,
            ],
            [
                'name' => 'Platinum Annual',
                'description' => 'Premium annual with personal training sessions.',
                'base_price' => 799.99,
                'signup_fee' => 50.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'years',
                'benefits' => ['has_pool_access' => true, 'has_sauna_access' => true, 'max_visits_per_month' => null, 'includes_pt_sessions' => 12],
                'is_active' => true,
            ],
            [
                'name' => 'Student Plan',
                'description' => 'Discounted plan for students with valid ID.',
                'base_price' => 19.99,
                'signup_fee' => 5.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false, 'max_visits_per_month' => 20],
                'is_active' => true,
            ],
            [
                'name' => 'Off-Peak Plan',
                'description' => 'Access only during off-peak hours (9am-4pm).',
                'base_price' => 24.99,
                'signup_fee' => 10.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => false, 'has_sauna_access' => false, 'max_visits_per_month' => null, 'allowed_hours' => ['start' => '09:00:00', 'end' => '16:00:00']],
                'is_active' => true,
            ],
            [
                'name' => 'Family Plan',
                'description' => 'Covers up to 4 family members.',
                'base_price' => 89.99,
                'signup_fee' => 25.00,
                'currency' => 'USD',
                'tax_percentage' => 5.00,
                'duration_value' => 1,
                'duration_unit' => 'months',
                'benefits' => ['has_pool_access' => true, 'has_sauna_access' => true, 'max_visits_per_month' => null, 'max_family_members' => 4],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::firstOrCreate(['name' => $plan['name']], $plan);
        }

        $this->command?->info('Seeded '.count($plans).' membership plans.');
    }

    private function seedUsers(): array
    {
        $users = [];
        for ($i = 1; $i <= self::USER_COUNT; $i++) {
            $users[] = User::create([
                'name' => fake()->name(),
                'email' => "staff{$i}@".fake()->freeEmailDomain(),
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => fake()->regexify('[a-zA-Z0-9]{10}'),
            ]);
        }

        $this->command?->info('Seeded '.count($users).' users.');

        return $users;
    }

    private function seedStaffProfiles(array $users): array
    {
        $roles = Role::pluck('id')->toArray();
        $statuses = ['Active', 'Active', 'Active', 'Active', 'On_Leave', 'Terminated'];
        $currencies = ['USD'];
        $staff = [];

        foreach ($users as $i => $user) {
            $hiredDate = fake()->dateTimeBetween('-5 years', '-1 month');
            $staff[] = StaffProfile::create([
                'user_id' => $user->id,
                'role_id' => fake()->randomElement($roles),
                'employment_status' => fake()->randomElement($statuses),
                'hired_date' => $hiredDate,
                'specialties' => fake()->randomElements(
                    ['Strength Training', 'Yoga', 'Cardio', 'Pilates', 'CrossFit', 'Nutrition', 'Physical Therapy', 'Zumba'],
                    fake()->numberBetween(1, 4)
                ),
                'base_hourly_rate' => fake()->randomFloat(2, 12, 45),
                'currency' => fake()->randomElement($currencies),
                'profile_photo_path' => null,
            ]);
        }

        $this->command?->info('Seeded '.count($staff).' staff profiles.');

        return $staff;
    }

    private function seedMembers(array $users, $plans): array
    {
        $planIds = $plans->pluck('id')->toArray();
        $statuses = ['Active', 'Active', 'Active', 'Active', 'Frozen', 'Cancelled', 'Expired'];
        $idDocTypes = ['passport', 'national_id', 'drivers_license'];
        $sources = ['walk_in', 'online', 'referral', 'social_media', 'partner'];
        $members = [];

        $uniqueEmails = [];
        $uniqueRfids = [];

        for ($i = 0; $i < self::MEMBER_COUNT; $i++) {
            $uniqueEmails[] = "member{$i}@".fake()->freeEmailDomain();
            $uniqueRfids[] = 'RFID-'.strtoupper(fake()->bothify('##########??'));
        }

        $batchSize = 50;
        $batches = array_chunk(range(0, self::MEMBER_COUNT - 1), $batchSize);

        foreach ($batches as $batchIndices) {
            $batchMembers = [];
            foreach ($batchIndices as $idx) {
                $planId = fake()->randomElement($planIds);
                $plan = $plans->find($planId);
                $startDate = fake()->dateTimeBetween('-2 years', '-1 day');
                $status = fake()->randomElement($statuses);
                $isActive = $status === 'Active';
                $isCancelled = $status === 'Cancelled';
                $isFrozen = $status === 'Frozen';

                $memberData = [
                    'registered_by' => fake()->randomElement($users)->id,
                    'registered_at' => fake()->dateTimeBetween('-2 years', 'now'),
                    'registration_source' => fake()->randomElement($sources),
                    'first_name' => fake()->firstName(),
                    'last_name' => fake()->lastName(),
                    'email' => $uniqueEmails[$idx],
                    'phone_number' => fake()->numerify('+1###########'),
                    'date_of_birth' => fake()->dateTimeBetween('-70 years', '-18 years'),
                    'profile_photo_path' => null,
                    'id_document_type' => fake()->randomElement($idDocTypes),
                    'id_document_path' => null,
                    'is_verified' => fake()->boolean(80),
                    'access_token_barcode' => strtoupper(fake()->bothify('ACC-##########')),
                    'rfid_card_number' => $uniqueRfids[$idx],
                    'current_session_id' => null,
                    'status' => $status,
                    'current_plan_id' => $planId,
                    'start_date' => $startDate,
                    'end_date' => $plan ? $plan->calculateEndDate($startDate->format('Y-m-d')) : null,
                    'freeze_start_date' => $isFrozen ? fake()->dateTimeBetween('-30 days', '-1 day') : null,
                    'freeze_end_date' => $isFrozen ? fake()->dateTimeBetween('+1 day', '+30 days') : null,
                    'freeze_reason' => $isFrozen ? fake()->randomElement(['Medical', 'Travel', 'Personal', 'Financial']) : null,
                    'cancellation_requested_date' => $isCancelled ? fake()->dateTimeBetween('-60 days', '-1 day') : null,
                    'effective_cancellation_date' => $isCancelled ? fake()->dateTimeBetween('-30 days', 'now') : null,
                    'cancellation_reason' => $isCancelled ? fake()->sentence() : null,
                ];

                $batchMembers[] = Member::create($memberData);
            }

            $members = array_merge($members, $batchMembers);
        }

        $this->command?->info('Seeded '.count($members).' members.');

        $members = Member::all()->toArray();
        $memberObjects = [];
        foreach ($members as $m) {
            $memberObjects[] = (object) $m;
        }

        return $memberObjects;
    }

    private function seedCheckinLogs(array $members): void
    {
        $methods = ['barcode', 'rfid', 'manual', 'mobile_app'];
        $batchSize = 200;
        $logs = [];

        foreach ($members as $member) {
            $numLogs = fake()->numberBetween(1, self::CHECKIN_COUNT_PER_MEMBER);
            $startDate = fake()->dateTimeBetween('-6 months', 'now');

            for ($j = 0; $j < $numLogs; $j++) {
                $checkIn = fake()->dateTimeBetween($startDate, 'now');
                $checkOut = fake()->boolean(70)
                    ? fake()->dateTimeBetween($checkIn, '+'.fake()->numberBetween(1, 4).' hours')
                    : null;

                $logs[] = [
                    'member_id' => (int) $member->id,
                    'check_in_timestamp' => $checkIn->format('Y-m-d H:i:s'),
                    'check_out_timestamp' => $checkOut?->format('Y-m-d H:i:s'),
                    'check_in_method' => fake()->randomElement($methods),
                    'denial_reason' => null,
                    'created_at' => $checkIn->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ];

                if (count($logs) >= $batchSize) {
                    CheckinLog::insert($logs);
                    $logs = [];
                }
            }
        }

        if ($logs !== []) {
            CheckinLog::insert($logs);
        }

        $this->command?->info('Seeded checkin logs.');
    }

    private function seedDebtLedger(array $members): void
    {
        $statuses = ['Settled', 'Settled', 'Settled', 'Overdue', 'Overdue', 'Pending', 'In_Collections'];
        $batchSize = 100;
        $entries = [];

        foreach ($members as $member) {
            $totalInvoiced = fake()->randomFloat(2, 0, 2000);
            $totalPaid = fake()->randomFloat(2, 0, $totalInvoiced);
            $outstanding = round($totalInvoiced - $totalPaid, 2);
            $status = $outstanding > 0
                ? fake()->randomElement(['Overdue', 'Pending', 'In_Collections'])
                : 'Settled';

            $entries[] = [
                'member_id' => (int) $member->id,
                'total_invoiced_amount' => $totalInvoiced,
                'total_paid_amount' => $totalPaid,
                'outstanding_balance' => $outstanding,
                'days_overdue' => $outstanding > 0 ? fake()->numberBetween(1, 120) : 0,
                'payment_urgency_status' => $status,
                'last_status_update' => fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d H:i:s'),
                'created_at' => now()->format('Y-m-d H:i:s'),
                'updated_at' => now()->format('Y-m-d H:i:s'),
            ];

            if (count($entries) >= $batchSize) {
                DebtLedger::insert($entries);
                $entries = [];
            }
        }

        if ($entries !== []) {
            DebtLedger::insert($entries);
        }

        $this->command?->info('Seeded debt ledger entries.');
    }

    private function seedInvoices(array $members, $plans): array
    {
        $statuses = ['draft', 'draft', 'sent', 'paid', 'paid', 'paid', 'overdue', 'cancelled', 'refunded'];
        $planIds = $plans->pluck('id')->toArray();
        $invoices = [];

        $invoiceNumber = 1;

        foreach ($members as $member) {
            $numInvoices = fake()->numberBetween(0, self::INVOICE_COUNT_PER_MEMBER);

            for ($j = 0; $j < $numInvoices; $j++) {
                $planId = fake()->randomElement($planIds);
                $issuedDate = fake()->dateTimeBetween('-1 year', 'now');
                $status = fake()->randomElement($statuses);

                $lineItems = [
                    ['description' => fake()->randomElement(['Monthly Membership', 'Annual Membership', 'Registration Fee', 'PT Session', 'Class Pass']), 'amount' => fake()->randomFloat(2, 10, 500)],
                ];

                if (fake()->boolean(30)) {
                    $lineItems[] = ['description' => fake()->randomElement(['Late Fee', 'Locker Rental', 'Towel Service', 'Nutrition Plan']), 'amount' => fake()->randomFloat(2, 5, 50)];
                }

                $subtotal = round(collect($lineItems)->sum('amount'), 2);
                $tax = round($subtotal * 0.05, 2);
                $discount = fake()->boolean(20) ? round($subtotal * fake()->randomFloat(2, 0.05, 0.15), 2) : 0;
                $grandTotal = round($subtotal + $tax - $discount, 2);

                $inv = Invoice::create([
                    'invoice_number' => 'INV-'.now()->year.'-'.str_pad((string) $invoiceNumber++, 6, '0', STR_PAD_LEFT),
                    'member_id' => (int) $member->id,
                    'plan_id' => $planId,
                    'issued_date' => $issuedDate,
                    'due_date' => fake()->dateTimeBetween($issuedDate, '+30 days'),
                    'line_items' => $lineItems,
                    'subtotal' => $subtotal,
                    'tax_total' => $tax,
                    'discount_total' => $discount,
                    'grand_total' => $grandTotal,
                    'status' => $status,
                    'notes' => fake()->optional(0.3)->sentence(),
                    'receipt_pdf_url' => null,
                    'finalized_at' => in_array($status, ['sent', 'paid', 'overdue']) ? $issuedDate : null,
                ]);

                $invoices[] = $inv;
            }
        }

        $this->command?->info('Seeded '.count($invoices).' invoices.');

        return $invoices;
    }

    private function seedPayments($plans, array $members): void
    {
        $methods = ['Cash', 'Card', 'Mobile_Money'];
        $memberIds = collect($members)->pluck('id')->toArray();
        $planIds = $plans->pluck('id')->toArray();

        $bar = $this->command?->getOutput()->createProgressBar(count($members));
        $bar?->start();

        foreach ($members as $member) {
            if (fake()->boolean(70)) {
                $planId = fake()->randomElement($planIds);
                $plan = $plans->find($planId);
                $method = fake()->randomElement($methods);
                $durationValue = fake()->numberBetween(1, 3);
                $requiredAmount = $plan ? (float) $plan->base_price * $durationValue : fake()->randomFloat(2, 10, 500);

                $metadata = match ($method) {
                    'Cash' => ['processor' => null, 'gateway_reference_id' => null, 'received_by_staff_id' => fake()->numberBetween(1, 25), 'last_four_digits' => null],
                    'Card' => ['processor' => 'Stripe', 'gateway_reference_id' => 'TXN_'.strtoupper(fake()->bothify('???_##########')), 'received_by_staff_id' => null, 'last_four_digits' => fake()->numerify('####')],
                    'Mobile_Money' => ['processor' => fake()->randomElement(['Telebirr', 'Chapa', 'M-Pesa']), 'gateway_reference_id' => 'TXN_MM_'.strtoupper(fake()->bothify('##########X')), 'received_by_staff_id' => null, 'last_four_digits' => null],
                };

                Payment::create([
                    'plan_id' => $planId,
                    'member_id' => (int) $member->id,
                    'amount_paid' => $requiredAmount,
                    'required_amount' => $requiredAmount,
                    'duration_value' => $durationValue,
                    'duration_unit' => $plan->duration_unit ?? 'months',
                    'payment_timestamp' => fake()->dateTimeBetween('-30 days', 'now'),
                    'payment_method' => $method,
                    'transaction_metadata' => $metadata,
                    'refunded_at' => null,
                    'refund_amount' => null,
                    'refund_reason' => null,
                ]);
            }

            $bar?->advance();
        }

        $bar?->finish();
        $this->command?->newLine();
        $this->command?->info('Seeded payments.');
    }

    private function seedMembershipFreezes(array $members, array $staffProfiles): void
    {
        $reasons = ['Medical', 'Travel', 'Personal', 'Financial', 'Military_Deployment'];
        $staffIds = collect($staffProfiles)->pluck('id')->toArray();
        $batchSize = 25;
        $freezes = [];
        $count = 0;

        foreach ($members as $member) {
            if (fake()->boolean(round((self::FREEZE_COUNT / self::MEMBER_COUNT) * 100))) {
                $initiatedAt = fake()->dateTimeBetween('-6 months', 'now');
                $scheduledUnfreeze = fake()->dateTimeBetween($initiatedAt, '+30 days');

                $freezes[] = [
                    'member_id' => (int) $member->id,
                    'freeze_initiated_at' => $initiatedAt->format('Y-m-d H:i:s'),
                    'scheduled_unfreeze_date' => $scheduledUnfreeze->format('Y-m-d'),
                    'actual_unfreeze_timestamp' => fake()->boolean(60)
                        ? fake()->dateTimeBetween($initiatedAt, $scheduledUnfreeze)->format('Y-m-d H:i:s')
                        : null,
                    'total_days_paused' => fake()->numberBetween(3, 30),
                    'freeze_reason' => fake()->randomElement($reasons),
                    'authorized_by_staff_id' => fake()->randomElement($staffIds),
                    'created_at' => $initiatedAt->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ];
                $count++;

                if (count($freezes) >= $batchSize) {
                    MembershipFreeze::insert($freezes);
                    $freezes = [];
                }
            }
        }

        if ($freezes !== []) {
            MembershipFreeze::insert($freezes);
        }

        $this->command?->info("Seeded {$count} membership freezes.");
    }

    private function seedEmployeeAttendanceLogs(array $staffProfiles): void
    {
        $methods = ['Manual_Admin', 'Biometric', 'QR_Code', 'Mobile_App'];
        $batchSize = 200;
        $logs = [];

        foreach ($staffProfiles as $profile) {
            $numLogs = fake()->numberBetween(5, self::ATTENDANCE_LOG_COUNT_PER_STAFF);

            for ($j = 0; $j < $numLogs; $j++) {
                $clockIn = fake()->dateTimeBetween('-3 months', 'now');
                $clockOut = fake()->boolean(85)
                    ? fake()->dateTimeBetween($clockIn, '+'.fake()->numberBetween(4, 10).' hours')
                    : null;

                $logs[] = [
                    'staff_profile_id' => $profile->id,
                    'clock_in_timestamp' => $clockIn->format('Y-m-d H:i:s'),
                    'clock_out_timestamp' => $clockOut?->format('Y-m-d H:i:s'),
                    'clock_in_method' => fake()->randomElement($methods),
                    'created_at' => $clockIn->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ];

                if (count($logs) >= $batchSize) {
                    EmployeeAttendanceLog::insert($logs);
                    $logs = [];
                }
            }
        }

        if ($logs !== []) {
            EmployeeAttendanceLog::insert($logs);
        }

        $this->command?->info('Seeded employee attendance logs.');
    }

    private function seedStaffLeaveRequests(array $staffProfiles): void
    {
        $leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid'];
        $statuses = ['Pending', 'Pending', 'Approved', 'Approved', 'Denied', 'Cancelled'];
        $staffIds = collect($staffProfiles)->pluck('id')->toArray();
        $batchSize = 25;
        $requests = [];

        foreach ($staffProfiles as $staff) {
            $numRequests = fake()->numberBetween(0, self::LEAVE_REQUEST_COUNT_PER_STAFF);

            for ($j = 0; $j < $numRequests; $j++) {
                $startDate = fake()->dateTimeBetween('-6 months', '+3 months');
                $endDays = fake()->numberBetween(1, 14);
                $endDate = (clone $startDate)->modify("+{$endDays} days");
                $status = fake()->randomElement($statuses);
                $isApproved = $status === 'Approved';
                $isDenied = $status === 'Denied';

                $requests[] = [
                    'staff_profile_id' => $staff->id,
                    'leave_type' => fake()->randomElement($leaveTypes),
                    'status' => $status,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'reason' => fake()->optional(0.8)->sentence(),
                    'approved_by' => $isApproved ? fake()->randomElement($staffIds) : null,
                    'approved_at' => $isApproved ? fake()->dateTimeBetween('-30 days', 'now')->format('Y-m-d H:i:s') : null,
                    'denial_reason' => $isDenied ? fake()->sentence() : null,
                    'created_at' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d H:i:s'),
                    'updated_at' => now()->format('Y-m-d H:i:s'),
                ];

                if (count($requests) >= $batchSize) {
                    StaffLeaveRequest::insert($requests);
                    $requests = [];
                }
            }
        }

        if ($requests !== []) {
            StaffLeaveRequest::insert($requests);
        }

        $this->command?->info('Seeded staff leave requests.');
    }

    private function seedExpenses(): void
    {
        $categories = [
            'Utilities' => ['Electricity Bill', 'Water Bill', 'Internet Service', 'Gas Supply'],
            'Maintenance' => ['Equipment Repair', 'Plumbing', 'Painting', 'HVAC Service', 'Pool Cleaning'],
            'Supplies' => ['Cleaning Supplies', 'Office Supplies', 'Towels', 'Lockers'],
            'Equipment' => ['Treadmill', 'Dumbbells', 'Bench Press', 'Cable Machine', 'Exercise Mats'],
            'Marketing' => ['Social Media Ads', 'Flyers', 'Billboard', 'Radio Ad'],
            'Rent' => ['Monthly Rent', 'Parking Fee'],
            'Insurance' => ['Liability Insurance', 'Property Insurance'],
            'Payroll' => ['Staff Salaries', 'Contractor Payment'],
        ];

        $categoryKeys = array_keys($categories);
        $batchSize = 100;
        $expenses = [];
        $count = 0;

        for ($i = 0; $i < self::EXPENSE_COUNT; $i++) {
            $category = fake()->randomElement($categoryKeys);
            $description = fake()->randomElement($categories[$category]);

            $expenses[] = [
                'description' => $description.' - '.fake()->monthName().' '.fake()->year(),
                'category' => $category,
                'amount' => fake()->randomFloat(2, 15, 5000),
                'expense_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'notes' => fake()->optional(0.4)->sentence(),
                'created_at' => now()->format('Y-m-d H:i:s'),
                'updated_at' => now()->format('Y-m-d H:i:s'),
            ];
            $count++;

            if (count($expenses) >= $batchSize) {
                Expense::insert($expenses);
                $expenses = [];
            }
        }

        if ($expenses !== []) {
            Expense::insert($expenses);
        }

        $this->command?->info("Seeded {$count} expenses.");
    }
}
