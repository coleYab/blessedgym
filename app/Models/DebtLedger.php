<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebtLedger extends Model
{
    protected $table = 'debt_ledger';

    protected $fillable = [
        'member_id',
        'total_invoiced_amount',
        'total_paid_amount',
        'outstanding_balance',
        'days_overdue',
        'payment_urgency_status',
        'last_status_update',
    ];

    protected function casts(): array
    {
        return [
            'total_invoiced_amount' => 'decimal:2',
            'total_paid_amount' => 'decimal:2',
            'outstanding_balance' => 'decimal:2',
            'days_overdue' => 'integer',
            'last_status_update' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
