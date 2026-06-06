<?php

namespace App\Models;

use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Member extends Model
{
    /** @use HasFactory<MemberFactory> */
    use HasFactory;

    protected $fillable = [
        'registered_by',
        'registered_at',
        'registration_source',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'date_of_birth',
        'profile_photo_path',
        'id_document_type',
        'id_document_path',
        'is_verified',
        'access_token_barcode',
        'rfid_card_number',
        'current_session_id',
        'status',
        'current_plan_id',
        'start_date',
        'end_date',
        'freeze_start_date',
        'freeze_end_date',
        'freeze_reason',
        'cancellation_requested_date',
        'effective_cancellation_date',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'date_of_birth' => 'date',
            'is_verified' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
            'freeze_start_date' => 'date',
            'freeze_end_date' => 'date',
            'cancellation_requested_date' => 'date',
            'effective_cancellation_date' => 'date',
        ];
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registered_by');
    }

    public function currentPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'current_plan_id');
    }

    public function currentSession(): HasOne
    {
        return $this->hasOne(CheckinLog::class, 'id', 'current_session_id');
    }

    public function checkinLogs(): HasMany
    {
        return $this->hasMany(CheckinLog::class);
    }
}
