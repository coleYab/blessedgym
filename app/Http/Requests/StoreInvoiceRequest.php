<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'plan_id' => ['nullable', 'integer', 'exists:membership_plans,id'],
            'issued_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issued_date'],
            'line_items' => ['required', 'array', 'min:1'],
            'line_items.*.description' => ['required', 'string', 'max:500'],
            'line_items.*.amount' => ['required', 'numeric', 'min:0'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax_total' => ['required', 'numeric', 'min:0'],
            'discount_total' => ['required', 'numeric', 'min:0'],
            'grand_total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['draft', 'finalized'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
