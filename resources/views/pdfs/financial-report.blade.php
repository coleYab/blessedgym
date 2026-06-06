<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1a1a1a; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { font-size: 18px; margin: 0 0 4px; }
        .header p { color: #666; margin: 0; font-size: 10px; }
        .kpi-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .kpi-card { flex: 1; min-width: 120px; border: 1px solid #ddd; border-radius: 4px; padding: 8px; text-align: center; }
        .kpi-card .label { font-size: 8px; color: #666; text-transform: uppercase; }
        .kpi-card .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
        .kpi-card .positive { color: #10b981; }
        .kpi-card .negative { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; font-size: 9px; }
        th { background: #f5f5f5; font-weight: 600; }
        .section-title { font-size: 12px; font-weight: bold; margin: 16px 0 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .text-right { text-align: right; }
        .text-success { color: #10b981; }
        .text-danger { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financial Report</h1>
        <p>Period: {{ ucfirst($period) }} | {{ $year }}-{{ str_pad($month, 2, '0', STR_PAD_LEFT) }}</p>
        <p>Generated: {{ $generated_at }}</p>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="label">Total Revenue</div>
            <div class="value text-success">${{ number_format($total_revenue, 2) }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Expenses</div>
            <div class="value text-danger">${{ number_format($total_expenses, 2) }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Net Profit</div>
            <div class="value {{ $net_profit >= 0 ? 'text-success' : 'text-danger' }}">${{ number_format($net_profit, 2) }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Outstanding</div>
            <div class="value">${{ number_format($outstanding_revenue, 2) }}</div>
        </div>
        <div class="kpi-card">
            <div class="label">Total Refunds</div>
            <div class="value text-danger">${{ number_format($total_refunds, 2) }}</div>
        </div>
    </div>

    <div class="section-title">Revenue by Plan</div>
    <table>
        <thead>
            <tr><th>Plan</th><th class="text-right">Revenue</th></tr>
        </thead>
        <tbody>
            @forelse ($revenue_by_plan as $plan)
                <tr><td>{{ $plan['name'] }}</td><td class="text-right">${{ number_format($plan['revenue'], 2) }}</td></tr>
            @empty
                <tr><td colspan="2" style="text-align:center;color:#999;">No revenue data for this period.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">Monthly Profit &amp; Loss</div>
    <table>
        <thead>
            <tr><th>Month</th><th class="text-right">Revenue</th><th class="text-right">Expenses</th><th class="text-right">Profit</th></tr>
        </thead>
        <tbody>
            @foreach ($monthly_pnl as $row)
                <tr>
                    <td>{{ $row['month'] }}</td>
                    <td class="text-right">${{ number_format($row['revenue'], 2) }}</td>
                    <td class="text-right">${{ number_format($row['expenses'], 2) }}</td>
                    <td class="text-right {{ $row['profit'] >= 0 ? 'text-success' : 'text-danger' }}">${{ number_format($row['profit'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Expenses by Category</div>
    <table>
        <thead>
            <tr><th>Category</th><th class="text-right">Amount</th></tr>
        </thead>
        <tbody>
            @forelse ($expenses_by_category as $exp)
                <tr><td>{{ $exp['category'] }}</td><td class="text-right">${{ number_format($exp['total'], 2) }}</td></tr>
            @empty
                <tr><td colspan="2" style="text-align:center;color:#999;">No expenses recorded.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
