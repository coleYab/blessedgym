<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dateTime('refunded_at')->nullable()->after('transaction_metadata');
            $table->decimal('refund_amount', 12, 2)->nullable()->after('refunded_at');
            $table->string('refund_reason')->nullable()->after('refund_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['refunded_at', 'refund_amount', 'refund_reason']);
        });
    }
};
