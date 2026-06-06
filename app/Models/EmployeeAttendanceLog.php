<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAttendanceLog extends Model
{
    protected $fillable = [
        'staff_profile_id',
        'clock_in_timestamp',
        'clock_out_timestamp',
        'clock_in_method',
    ];

    protected function casts(): array
    {
        return [
            'clock_in_timestamp' => 'datetime',
            'clock_out_timestamp' => 'datetime',
        ];
    }

    public function staffProfile(): BelongsTo
    {
        return $this->belongsTo(StaffProfile::class);
    }
}
