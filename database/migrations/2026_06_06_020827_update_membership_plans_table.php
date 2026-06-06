<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            $table->dropColumn(['price', 'duration_days']);
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->decimal('base_price', 10, 2)->default(0)->after('description');
            $table->decimal('signup_fee', 10, 2)->nullable()->after('base_price');
            $table->string('currency', 3)->default('USD')->after('signup_fee');
            $table->decimal('tax_percentage', 5, 2)->nullable()->after('currency');
            $table->integer('duration_value')->default(1)->after('tax_percentage');
            $table->string('duration_unit', 10)->default('months')->after('duration_value');
            $table->json('benefits')->nullable()->after('duration_unit');
        });
    }

    public function down(): void
    {
        Schema::table('membership_plans', function (Blueprint $table) {
            $table->dropColumn([
                'base_price', 'signup_fee', 'currency',
                'tax_percentage', 'duration_value', 'duration_unit', 'benefits',
            ]);
        });

        Schema::table('membership_plans', function (Blueprint $table) {
            $table->integer('duration_days')->after('description');
            $table->decimal('price', 10, 2)->after('duration_days');
        });
    }
};
