<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffLeaveRequest extends Model
{
    protected $fillable = [
        'staff_profile_id',
        'leave_type',
        'status',
        'start_date',
        'end_date',
        'reason',
        'approved_by',
        'approved_at',
        'denial_reason',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function staffProfile(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class, 'approved_by');
    }
}
