<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'signup_fee' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'duration_value' => ['required', 'integer', 'min:1'],
            'duration_unit' => ['required', 'string', 'in:days,weeks,months,years'],
            'benefits' => ['nullable', 'array'],
            'benefits.has_pool_access' => ['boolean'],
            'benefits.has_sauna_access' => ['boolean'],
            'benefits.max_visits_per_month' => ['nullable', 'integer', 'min:1'],
            'benefits.allowed_hours' => ['nullable', 'array'],
            'benefits.allowed_hours.start' => ['nullable', 'date_format:H:i:s'],
            'benefits.allowed_hours.end' => ['nullable', 'date_format:H:i:s'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'duration_unit.in' => 'Duration must be one of: days, weeks, months, or years.',
        ];
    }
}
