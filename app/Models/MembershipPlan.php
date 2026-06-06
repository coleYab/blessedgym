<?php

namespace App\Models;

use Database\Factories\MembershipPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipPlan extends Model
{
    /** @use HasFactory<MembershipPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'base_price',
        'signup_fee',
        'currency',
        'tax_percentage',
        'duration_value',
        'duration_unit',
        'benefits',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'signup_fee' => 'decimal:2',
            'tax_percentage' => 'decimal:2',
            'benefits' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'current_plan_id');
    }

    public function calculateEndDate(string $startDate): string
    {
        return match ($this->duration_unit) {
            'days' => date('Y-m-d', strtotime($startDate." +{$this->duration_value} days")),
            'weeks' => date('Y-m-d', strtotime($startDate." +{$this->duration_value} weeks")),
            'months' => date('Y-m-d', strtotime($startDate." +{$this->duration_value} months")),
            'years' => date('Y-m-d', strtotime($startDate." +{$this->duration_value} years")),
            default => $startDate,
        };
    }
}
