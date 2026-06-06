<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->string('employment_status')->default('Active'); // Active, Suspended, Terminated
            $table->date('hired_date');
            $table->json('specialties')->nullable();
            $table->decimal('base_hourly_rate', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('profile_photo_path')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
