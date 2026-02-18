'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function EmailLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/email-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
            toast.error('Failed to load email logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <h1 className="text-3xl font-extrabold text-[#111827] mb-2">System Email Logs</h1>
            <p className="text-gray-500 mb-8">View all transactional emails sent by the system (Simulated).</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Recipient</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No emails sent yet.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{log.userId?.firstName || 'System'} {log.userId?.lastName}</div>
                                        <div className="text-xs text-gray-400">{log.userId?.email || 'Unknown'}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {log.title.replace('Email Sent: ', '')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                            Sent (Mock)
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
