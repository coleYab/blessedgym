<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('access_token_barcode')->nullable()->after('id_document_path');
            $table->string('rfid_card_number')->nullable()->unique()->after('access_token_barcode');
        });

        Schema::create('checkin_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members');
            $table->dateTime('check_in_timestamp');
            $table->dateTime('check_out_timestamp')->nullable();
            $table->string('check_in_method');
            $table->string('denial_reason')->nullable();
            $table->timestamps();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('current_session_id')->nullable()->constrained('checkin_logs')->after('rfid_card_number');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['current_session_id']);
            $table->dropColumn('current_session_id');
        });

        Schema::dropIfExists('checkin_logs');

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['access_token_barcode', 'rfid_card_number']);
        });
    }
};
