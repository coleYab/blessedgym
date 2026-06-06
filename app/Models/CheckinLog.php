<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckinLog extends Model
{
    protected $fillable = [
        'member_id',
        'check_in_timestamp',
        'check_out_timestamp',
        'check_in_method',
        'denial_reason',
    ];

    protected function casts(): array
    {
        return [
            'check_in_timestamp' => 'datetime',
            'check_out_timestamp' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
