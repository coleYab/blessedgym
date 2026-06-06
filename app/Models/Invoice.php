<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'member_id',
        'plan_id',
        'issued_date',
        'due_date',
        'line_items',
        'subtotal',
        'tax_total',
        'discount_total',
        'grand_total',
        'status',
        'notes',
        'receipt_pdf_url',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_date' => 'datetime',
            'due_date' => 'datetime',
            'line_items' => 'array',
            'subtotal' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'finalized_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function isEditable(): bool
    {
        return $this->status === 'draft';
    }
}
