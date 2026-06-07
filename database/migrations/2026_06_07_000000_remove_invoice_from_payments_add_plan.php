<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('payments', 'invoice_id')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropForeign(['invoice_id']);
                $table->dropColumn('invoice_id');
            });
        }

        if (! Schema::hasColumn('payments', 'plan_id')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreignId('plan_id')->constrained('membership_plans');
                $table->integer('duration_value');
                $table->string('duration_unit');
                $table->decimal('required_amount', 12, 2);
            });
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'plan_id')) {
                $table->dropForeign(['plan_id']);
                $table->dropColumn(['plan_id', 'duration_value', 'duration_unit', 'required_amount']);
            }
        });

        if (! Schema::hasColumn('payments', 'invoice_id')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            });
        }
    }
};
