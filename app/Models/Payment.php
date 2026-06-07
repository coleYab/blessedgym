<?php

namespace App\Models;

use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    protected $fillable = [
        'plan_id',
        'member_id',
        'amount_paid',
        'required_amount',
        'duration_value',
        'duration_unit',
        'payment_timestamp',
        'payment_method',
        'transaction_metadata',
        'refunded_at',
        'refund_amount',
        'refund_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'required_amount' => 'decimal:2',
            'payment_timestamp' => 'datetime',
            'transaction_metadata' => 'array',
            'refunded_at' => 'datetime',
            'refund_amount' => 'decimal:2',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }
}
