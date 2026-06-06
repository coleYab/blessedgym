<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_freezes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->dateTime('freeze_initiated_at');
            $table->date('scheduled_unfreeze_date');
            $table->dateTime('actual_unfreeze_timestamp')->nullable();
            $table->integer('total_days_paused');
            $table->string('freeze_reason'); // Medical_Injury, Travel, Personal
            $table->unsignedBigInteger('authorized_by_staff_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_freezes');
    }
};
