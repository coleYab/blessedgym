<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employee_attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained()->cascadeOnDelete();
            $table->dateTime('clock_in_timestamp');
            $table->dateTime('clock_out_timestamp')->nullable();
            $table->string('clock_in_method')->default('Manual_Admin');
            $table->timestamps();
        });

        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->foreignId('current_attendance_id')->nullable()->constrained('employee_attendance_logs')->after('profile_photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->dropForeign(['current_attendance_id']);
            $table->dropColumn('current_attendance_id');
        });

        Schema::dropIfExists('employee_attendance_logs');
    }
};
