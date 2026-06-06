<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('duration_days');
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->string('status')->default('Active')->after('is_verified');
            $table->foreignId('current_plan_id')->nullable()->constrained('membership_plans')->after('status');
            $table->date('start_date')->nullable()->after('current_plan_id');
            $table->date('end_date')->nullable()->after('start_date');
            $table->date('freeze_start_date')->nullable()->after('end_date');
            $table->date('freeze_end_date')->nullable()->after('freeze_start_date');
            $table->string('freeze_reason')->nullable()->after('freeze_end_date');
            $table->date('cancellation_requested_date')->nullable()->after('freeze_reason');
            $table->date('effective_cancellation_date')->nullable()->after('cancellation_requested_date');
            $table->text('cancellation_reason')->nullable()->after('effective_cancellation_date');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'current_plan_id',
                'start_date',
                'end_date',
                'freeze_start_date',
                'freeze_end_date',
                'freeze_reason',
                'cancellation_requested_date',
                'effective_cancellation_date',
                'cancellation_reason',
            ]);
        });

        Schema::dropIfExists('membership_plans');
    }
};
