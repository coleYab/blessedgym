<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipFreeze extends Model
{
    protected $fillable = [
        'member_id',
        'freeze_initiated_at',
        'scheduled_unfreeze_date',
        'actual_unfreeze_timestamp',
        'total_days_paused',
        'freeze_reason',
        'authorized_by_staff_id',
    ];

    protected function casts(): array
    {
        return [
            'freeze_initiated_at' => 'datetime',
            'scheduled_unfreeze_date' => 'date',
            'actual_unfreeze_timestamp' => 'datetime',
            'total_days_paused' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
