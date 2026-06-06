<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class StaffProfile extends Model
{
    protected $fillable = [
        'user_id',
        'role_id',
        'employment_status',
        'hired_date',
        'specialties',
        'base_hourly_rate',
        'currency',
        'profile_photo_path',
    ];

    protected function casts(): array
    {
        return [
            'hired_date' => 'date',
            'specialties' => 'array',
            'base_hourly_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(EmployeeAttendanceLog::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(StaffLeaveRequest::class);
    }

    public function approvedLeaveRequests(): HasMany
    {
        return $this->hasMany(StaffLeaveRequest::class, 'approved_by');
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->profile_photo_path
            ? Storage::url($this->profile_photo_path)
            : null;
    }
}
