<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:members,email'],
            'phone_number' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'registration_source' => ['required', 'string', 'in:mobile_app,admin_dashboard,kiosk'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'id_document_type' => ['nullable', 'string', 'in:National_ID,Passport,Drivers_License'],
            'id_document' => ['nullable', 'image', 'max:5120'],
            'is_verified' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'date_of_birth.before' => 'The date of birth must be a date before today.',
            'registration_source.in' => 'The registration source must be one of: mobile app, admin dashboard, or kiosk.',
            'id_document_type.in' => 'The ID document type must be one of: National ID, Passport, or Driver\'s License.',
            'profile_photo.max' => 'The profile photo must not be larger than 2MB.',
            'id_document.max' => 'The ID document must not be larger than 5MB.',
        ];
    }
}
