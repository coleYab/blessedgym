<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debt_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_invoiced_amount', 12, 2)->default(0);
            $table->decimal('total_paid_amount', 12, 2)->default(0);
            $table->decimal('outstanding_balance', 12, 2)->default(0);
            $table->integer('days_overdue')->default(0);
            $table->string('payment_urgency_status')->default('Settled'); // Settled, Overdue_Grace_Period, Suspended_Non_Payment
            $table->dateTime('last_status_update')->nullable();
            $table->timestamps();

            $table->unique('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_ledger');
    }
};
