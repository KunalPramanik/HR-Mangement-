'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayrollSettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/payroll/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                } else {
                    console.error('Failed to fetch settings');
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggleFreeze = async () => {
        if (!settings) return; // Guard against null settings

        if (!confirm(`Are you sure you want to ${settings.isPayrollFrozen ? 'UNFREEZE' : 'FREEZE'} payroll processing?`)) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/payroll/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPayrollFrozen: !settings.isPayrollFrozen })
            });

            if (res.ok) {
                const updated = await res.json();
                setSettings(updated);
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Error updating settings');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading settings...</div>;

    if (!settings) return <div className="p-20 text-center font-bold text-red-500">Failed to load settings. Please refresh the page.</div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-extrabold text-[#111827] mb-8">Payroll Configuration</h1>

            <div className="space-y-6">
                {/* Global Freeze Control */}
                <div className={`p-8 rounded-2xl border-2 transition-colors ${settings.isPayrollFrozen ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`size-12 rounded-full flex items-center justify-center ${settings.isPayrollFrozen ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                <span className="material-symbols-outlined text-[28px]">{settings.isPayrollFrozen ? 'lock' : 'lock_open'}</span>
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${settings.isPayrollFrozen ? 'text-red-800' : 'text-green-800'}`}>
                                    Payroll is {settings.isPayrollFrozen ? 'FROZEN' : 'ACTIVE'}
                                </h3>
                                <p className="text-sm font-medium opacity-80">
                                    {settings.isPayrollFrozen
                                        ? 'No salary processing or disbursements can be initiated.'
                                        : 'Normal payroll operations are enabled.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleFreeze}
                            disabled={updating}
                            className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${settings.isPayrollFrozen
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                }`}
                        >
                            {updating ? 'Processing...' : (settings.isPayrollFrozen ? 'UNFREEZE PAYROLL' : 'FREEZE PAYROLL')}
                        </button>
                    </div>
                    {settings.updatedAt && (
                        <p className="text-xs font-mono opacity-60 text-right mt-2">
                            Last updated: {new Date(settings.updatedAt).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Other Settings (Placeholder) */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 opacity-60 pointer-events-none grayscale">
                    <h3 className="text-lg font-bold text-[#111827] mb-4">Pay Period Configuration</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cycle Start Day</label>
                            <input type="number" value={settings.payPeriodStart || 1} readOnly className="w-full p-3 bg-gray-50 rounded-lg font-bold text-gray-700" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cycle End Day</label>
                            <input type="number" value={settings.payPeriodEnd || 30} readOnly className="w-full p-3 bg-gray-50 rounded-lg font-bold text-gray-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
