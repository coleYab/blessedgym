<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'required_amount' => ['required', 'numeric', 'min:0'],
            'duration_value' => ['required', 'integer', 'min:1'],
            'duration_unit' => ['required', Rule::in(['days', 'weeks', 'months', 'years'])],
            'payment_timestamp' => ['required', 'date'],
            'payment_method' => ['required', Rule::in(['Cash', 'Card', 'Mobile_Money'])],
            'transaction_metadata' => ['nullable', 'array'],
            'transaction_metadata.processor' => ['nullable', 'string', 'max:255'],
            'transaction_metadata.gateway_reference_id' => ['nullable', 'string', 'max:255'],
            'transaction_metadata.received_by_staff_id' => ['nullable', 'integer'],
            'transaction_metadata.last_four_digits' => ['nullable', 'string', 'size:4'],
        ];
    }
}
