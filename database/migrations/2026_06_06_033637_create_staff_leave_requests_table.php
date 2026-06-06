<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type'); // Sick, Vacation, Personal, Family_Emergency, Other
            $table->string('status')->default('Pending'); // Pending, Approved, Denied
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('staff_profiles')->nullOnDelete();
            $table->dateTime('approved_at')->nullable();
            $table->text('denial_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_leave_requests');
    }
};
