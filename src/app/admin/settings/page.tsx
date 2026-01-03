'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AdminSettings() {
    const { data: session } = useSession();
    const [passwordFormat, setPasswordFormat] = useState('Firstname@Year'); // Default logic

    const allowedRoles = ['admin', 'director', 'cxo', 'vp', 'hr'];

    if (!session || !allowedRoles.includes(session.user.role)) {
        return <div className="p-10 text-center font-bold text-red-600">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 pb-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4">Password Policy (Auto-Generation)</h3>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <input type="radio" name="pwd" checked={passwordFormat === 'Firstname@Year'} onChange={() => setPasswordFormat('Firstname@Year')} />
                            <div>
                                <p className="font-bold text-sm">Firstname@Year (Default)</p>
                                <p className="text-xs text-slate-500">Example: John@2025</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <input type="radio" name="pwd" checked={passwordFormat === 'Company#ID'} onChange={() => setPasswordFormat('Company#ID')} />
                            <div>
                                <p className="font-bold text-sm">Company#ID</p>
                                <p className="text-xs text-slate-500">Example: Mindstar#1042</p>
                            </div>
                        </label>
                    </div>
                    <button className="mt-4 bg-[#135bec] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700">Save Policy</button>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-lg mb-4">Payslip Configuration</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Auto-Generate & Email</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Include Tax Breakdown</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
