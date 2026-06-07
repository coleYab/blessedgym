<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentHistoryController extends Controller
{
    public function index(Request $request, Member $member): JsonResponse
    {
        $query = Payment::with('plan')
            ->where('member_id', $member->id);

        if ($request->filled('method')) {
            $query->where('payment_method', $request->method);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('payment_timestamp', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('payment_timestamp', '<=', $request->date_to);
        }

        if ($request->filled('refund_status')) {
            match ($request->refund_status) {
                'refunded' => $query->whereNotNull('refunded_at'),
                'none' => $query->whereNull('refunded_at'),
                default => null,
            };
        }

        $payments = $query->orderBy('payment_timestamp', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
            'member' => [
                'id' => $member->id,
                'first_name' => $member->first_name,
                'last_name' => $member->last_name,
                'email' => $member->email,
            ],
        ]);
    }
}
