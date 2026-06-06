<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlanRequest;
use App\Models\MembershipPlan;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = MembershipPlan::query()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (MembershipPlan $plan) => [
                ...$plan->toArray(),
                'member_count' => $plan->members()->count(),
            ]);

        return Inertia::render('billing/plans', [
            'plans' => $plans,
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        MembershipPlan::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan created successfully.',
        ]);

        return to_route('billing.plans');
    }

    public function update(StorePlanRequest $request, MembershipPlan $plan): RedirectResponse
    {
        $plan->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan updated successfully.',
        ]);

        return to_route('billing.plans');
    }

    public function destroy(MembershipPlan $plan): RedirectResponse
    {
        if ($plan->members()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Cannot delete a plan with active members.',
            ]);

            return back();
        }

        $plan->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Plan deleted successfully.',
        ]);

        return to_route('billing.plans');
    }
}
