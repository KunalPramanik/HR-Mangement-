'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Pending');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Travel',
        amount: 0,
        description: ''
    });

    useEffect(() => {
        // Listen for custom event from previous attempt if any (cleanup)
        // But better to just use local state which I am doing now.
        fetchExpenses();
    }, [filter]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/expenses?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
        try {
            const body: any = { id, status: action };
            if (action === 'Rejected') {
                const reason = prompt('Enter rejection reason:');
                if (!reason) return;
                body.rejectionReason = reason;
            }

            const res = await fetch('/api/expenses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(`Expense ${action}`);
                fetchExpenses();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Error processing request');
        }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Expense Claim Submitted');
                setShowModal(false);
                fetchExpenses();
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    category: 'Travel',
                    amount: 0,
                    description: ''
                });
            } else {
                toast.error('Failed to submit expense');
            }
        } catch (error) {
            toast.error('Error submitting expense');
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Expense Requests</h1>
            <p className="text-slate-500 mb-8">Manage employee reimbursement claims.</p>

            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex gap-4">
                    {['Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${filter === status
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    New Claim
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">progress_activity</span>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No {filter.toLowerCase()} expenses found.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {expense.userId?.firstName} {expense.userId?.lastName}
                                            </div>
                                            <div className="text-xs text-slate-500">{expense.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {filter === 'Pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(expense._id, 'Approved')}
                                                        className="size-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                                                        title="Approve"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(expense._id, 'Rejected')}
                                                        className="size-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                                                        title="Reject"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Submit New Expense</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none">
                                    {['Travel', 'Food', 'Office Supplies', 'Training', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 border-slate-200 outline-none resize-none" placeholder="Details about this expense..." />
                            </div>

                            <button onClick={handleCreate} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-2">
                                Submit Claim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
