<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->constrained('membership_plans')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount_paid', 12, 2);
            $table->decimal('required_amount', 12, 2);
            $table->integer('duration_value');
            $table->string('duration_unit');
            $table->dateTime('payment_timestamp');
            $table->string('payment_method'); // Cash, Card, Mobile_Money
            $table->json('transaction_metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
