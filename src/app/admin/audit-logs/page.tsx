'use client';

import { useState } from 'react';

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Audit Data
    const logs = [
        { id: 'LOG-8821', user: 'Admin User', action: 'CREATE_USER', target: 'Marco Rossi', timestamp: new Date(Date.now() - 1000 * 60 * 5), details: 'Created new employee profile', ip: '192.168.1.10' },
        { id: 'LOG-8820', user: 'Sarah Jenkins', action: 'UPDATE_ASSET', target: 'MacBook Pro 16"', timestamp: new Date(Date.now() - 1000 * 60 * 45), details: 'Changed status to Assigned', ip: '192.168.1.24' },
        { id: 'LOG-8819', user: 'System', action: 'PAYROLL_RUN', target: 'Batch #2025-01', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: 'Processed 142 records', ip: 'localhost' },
        { id: 'LOG-8818', user: 'James Wilson', action: 'LOGIN_FAILED', target: '-', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), details: 'Invalid password attempt', ip: '192.168.1.55' },
        { id: 'LOG-8817', user: 'Admin User', action: 'DELETE_USER', target: 'Test User', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'Removed test account', ip: '192.168.1.10' },
    ];

    const filteredLogs = logs.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Audit Logs</h1>
                    <p className="text-[#6b7280] font-medium">Security trail of critical system actions.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                    />
                </div>
            </div>

            <div className="soft-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="p-4 pl-6">Timestamp</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Target</th>
                            <th className="p-4">Details</th>
                            <th className="p-4 pr-6 text-right">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                <td className="p-4 pl-6 text-gray-500 font-mono text-xs">
                                    {log.timestamp.toLocaleString()}
                                </td>
                                <td className="p-4 font-bold text-[#111827]">
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                            {log.user[0]}
                                        </div>
                                        {log.user}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold
                                        ${log.action.includes('DELETE') || log.action.includes('FAILED') ? 'bg-red-50 text-red-600' :
                                            log.action.includes('CREATE') || log.action.includes('PAYROLL') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}
                                    `}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-700">{log.target}</td>
                                <td className="p-4 text-gray-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                                <td className="p-4 pr-6 text-right text-gray-400 font-mono text-xs">{log.ip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
