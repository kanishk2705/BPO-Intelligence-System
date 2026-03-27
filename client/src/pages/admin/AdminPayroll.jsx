// client/src/pages/admin/AdminPayroll.jsx
import { useState, useEffect } from 'react';
import { Calculator, DollarSign, FileText, Loader2, CheckCircle, TrendingDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function AdminPayroll() {
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Default to the current month (Format: YYYY-MM)
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        fetchPayroll();
    }, [selectedMonth]);

    const fetchPayroll = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // The backend expects a full date string like '2026-02-01'
            const formattedDate = `${selectedMonth}-01`;

            const response = await fetch(`https://bpo-backend-vemc.onrender.com/api/payroll?month_year=${formattedDate}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch payroll data');

            const data = await response.json();
            setPayrollRecords(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Could not load payroll records.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunPayroll = async () => {
        setIsGenerating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const formattedDate = `${selectedMonth}-01`;

            // FIXED ROUTE: Matches the backend payrollRoutes.js POST endpoint
            const response = await fetch('https://bpo-backend-vemc.onrender.com/api/payroll/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ month_year: formattedDate })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate payroll');
            }

            toast.success(`Payroll generated for ${selectedMonth}!`);
            fetchPayroll(); // Refresh the table to show the new calculations
        } catch (error) {
            console.error('Payroll Generation Error:', error);
            toast.error(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const totalPayout = payrollRecords.reduce((sum, record) => sum + Number(record.final_salary), 0);
    const totalTaxes = payrollRecords.reduce((sum, record) => sum + Number(record.tax_deduction), 0);

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Payroll Engine</h1>
                    <p className="text-sm text-slate-500 mt-1">Automated salary calculation and tax deductions.</p>
                </div>

                <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <input
                        type="month"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <button
                        onClick={handleRunPayroll}
                        disabled={isGenerating}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                    >
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                        {isGenerating ? 'Calculating...' : 'Run Payroll'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Net Payout</p>
                        <p className="text-2xl font-bold text-slate-800">{formatMoney(totalPayout)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Total Tax Withheld</p>
                        <p className="text-2xl font-bold text-slate-800">{formatMoney(totalTaxes)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Payslips Generated</p>
                        <p className="text-2xl font-bold text-slate-800">{payrollRecords.length}</p>
                    </div>
                </div>
            </div>

            {/* Payroll Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : payrollRecords.length === 0 ? (
                    <div className="p-16 text-center text-slate-500 font-medium">
                        <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p>No payroll records found for this month.</p>
                        <p className="text-sm mt-1">Click "Run Payroll" to generate the calculations.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Hours</th>
                                    <th className="px-6 py-4">Night Bonus</th>
                                    <th className="px-6 py-4">Gross Pay</th>
                                    <th className="px-6 py-4">Tax (15%)</th>
                                    <th className="px-6 py-4 font-bold text-slate-900">Net Salary</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {payrollRecords.map((record) => {
                                    const grossPay = Number(record.final_salary) + Number(record.tax_deduction);

                                    return (
                                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{record.profiles?.full_name}</p>
                                                <p className="text-xs text-slate-500">{record.profiles?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">{record.total_hours}h</td>
                                            <td className="px-6 py-4 text-indigo-600 font-medium">+{formatMoney(record.night_shift_bonus)}</td>
                                            <td className="px-6 py-4">{formatMoney(grossPay)}</td>
                                            <td className="px-6 py-4 text-red-600 font-medium">-{formatMoney(record.tax_deduction)}</td>
                                            <td className="px-6 py-4 font-bold text-emerald-600 text-base">{formatMoney(record.final_salary)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}