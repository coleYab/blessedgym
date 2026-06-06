<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\MembershipPlan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InvoiceController extends Controller
{
    public function index(): InertiaResponse
    {
        $invoices = Invoice::with('member', 'plan')
            ->orderBy('created_at', 'desc')
            ->get();

        $members = Member::query()
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();

        $plans = MembershipPlan::query()
            ->select('id', 'name', 'base_price', 'currency')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $year = now()->year;
        $lastInvoice = Invoice::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();
        $nextNumber = $lastInvoice ? $lastInvoice->id + 1 : 1;
        $nextInvoiceNumber = 'INV-'.$year.'-'.str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);

        return Inertia::render('billing/invoices', [
            'invoices' => $invoices,
            'members' => $members,
            'plans' => $plans,
            'nextInvoiceNumber' => $nextInvoiceNumber,
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($data['status'] === 'finalized') {
            $data['finalized_at'] = now();
        }

        Invoice::create($data);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice created successfully.',
        ]);

        return to_route('billing.invoices');
    }

    public function finalize(Invoice $invoice): RedirectResponse
    {
        if ($invoice->status !== 'draft') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Only draft invoices can be finalized.',
            ]);

            return back();
        }

        $invoice->update([
            'status' => 'finalized',
            'finalized_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice #'.$invoice->invoice_number.' finalized.',
        ]);

        return to_route('billing.invoices');
    }

    public function pdf(Invoice $invoice): Response
    {
        $invoice->load('member', 'plan');

        $pdf = Pdf::loadView('pdfs.invoice', [
            'invoice' => $invoice,
        ]);

        return $pdf->download('invoice-'.$invoice->invoice_number.'.pdf');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        if ($invoice->status !== 'draft') {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Cannot delete a finalized invoice. Create a credit note instead.',
            ]);

            return back();
        }

        $invoice->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice deleted.',
        ]);

        return to_route('billing.invoices');
    }
}
