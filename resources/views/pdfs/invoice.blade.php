<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        @page { margin: 36px; }
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 10px;
            line-height: 1.5;
            color: #1e1e2e;
            margin: 0;
            padding: 0;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 20px;
        }

        .brand h1 {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #0a0a1a;
            margin: 0 0 2px;
        }

        .brand p {
            font-size: 9px;
            color: #64748b;
            margin: 0;
        }

        .invoice-title h2 {
            font-size: 16px;
            font-weight: 700;
            color: #0a0a1a;
            text-align: right;
            margin: 0 0 2px;
        }

        .invoice-title p {
            font-size: 9px;
            color: #64748b;
            text-align: right;
            margin: 0;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-finalized { background: #dcfce7; color: #166534; }
        .badge-paid { background: #dbeafe; color: #1e40af; }
        .badge-draft { background: #f1f5f9; color: #475569; }

        .info-grid {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
        }

        .info-box {
            flex: 1;
            background: #f8fafc;
            border-radius: 8px;
            padding: 12px 14px;
        }

        .info-box h3 {
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            margin: 0 0 6px;
        }

        .info-box p {
            font-size: 11px;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
        }

        .info-box small {
            font-size: 9px;
            color: #64748b;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        table.items thead th {
            background: #f1f5f9;
            padding: 8px 12px;
            font-size: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            text-align: left;
        }

        table.items thead th:last-child { text-align: right; }

        table.items tbody td {
            padding: 8px 12px;
            font-size: 10px;
            border-bottom: 1px solid #f1f5f9;
            color: #0f172a;
        }

        table.items tbody td:last-child { text-align: right; font-weight: 600; }

        table.items tbody tr:last-child td { border-bottom: none; }

        .totals {
            margin-left: auto;
            width: 260px;
        }

        .totals table { width: 100%; border-collapse: collapse; }

        .totals td {
            padding: 4px 0;
            font-size: 10px;
            color: #64748b;
        }

        .totals td:last-child { text-align: right; font-weight: 500; color: #0f172a; }

        .totals .grand-row td {
            padding-top: 8px;
            border-top: 2px solid #e2e8f0;
            font-size: 13px;
            font-weight: 700;
            color: #0a0a1a;
        }

        .footer {
            margin-top: 28px;
            padding-top: 14px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
        }

        .footer p { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <h1>Blessed Gym</h1>
            <p>Premium Fitness Solutions</p>
        </div>
        <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>{{ $invoice->invoice_number }}</p>
        </div>
    </div>

    <div style="text-align:right;margin-bottom:16px;">
        <span class="badge badge-{{ $invoice->status === 'finalized' ? 'finalized' : ($invoice->status === 'paid' ? 'paid' : 'draft') }}">
            {{ ucfirst($invoice->status) }}
        </span>
    </div>

    <div class="info-grid">
        <div class="info-box">
            <h3>Bill To</h3>
            <p>{{ $invoice->member->first_name }} {{ $invoice->member->last_name }}</p>
            <small>{{ $invoice->member->email }}</small>
        </div>
        <div class="info-box">
            <h3>Invoice Date</h3>
            <p>{{ $invoice->issued_date->format('M d, Y') }}</p>
            <small>Due: {{ $invoice->due_date->format('M d, Y') }}</small>
        </div>
        <div class="info-box">
            <h3>Plan</h3>
            <p>{{ $invoice->plan?->name ?? 'N/A' }}</p>
            <small>{{ $invoice->plan?->currency ?? 'USD' }}</small>
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th style="width:70%;">Description</th>
                <th style="width:30%;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($invoice->line_items as $item)
                <tr>
                    <td>{{ $item['description'] }}</td>
                    <td>{{ number_format((float) $item['amount'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal</td>
                <td>{{ number_format((float) $invoice->subtotal, 2) }}</td>
            </tr>
            @if ((float) $invoice->tax_total > 0)
                <tr>
                    <td>Tax</td>
                    <td>{{ number_format((float) $invoice->tax_total, 2) }}</td>
                </tr>
            @endif
            @if ((float) $invoice->discount_total > 0)
                <tr>
                    <td>Discount</td>
                    <td>-{{ number_format((float) $invoice->discount_total, 2) }}</td>
                </tr>
            @endif
            <tr class="grand-row">
                <td>Total Due</td>
                <td>{{ number_format((float) $invoice->grand_total, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>Blessed Gym</strong> &mdash; Premium Fitness Solutions</p>
        <p>Thank you for your business.</p>
    </div>
</body>
</html>
