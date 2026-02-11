'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReportsPage() {
    // Role access control is handled by middleware
    const router = useRouter();
    const [generating, setGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Add missing state variables
    const [attendanceStats, setAttendanceStats] = useState({ avgAttendance: 0, absentToday: 0 });
    const [deptDistribution, setDeptDistribution] = useState<{ name: string, percent: number, color: string }[]>([]);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]); // simplified type for logs
    const [viewMode, setViewMode] = useState('summary');
    const [cycleMonth, setCycleMonth] = useState(format(new Date(), 'MMM yyyy'));

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [selectedDate]);

    const fetchData = async () => {
        try {
            // 1. Fetch Attendance Stats
            const attRes = await fetch('/api/attendance/stats');
            if (attRes.ok) setAttendanceStats(await attRes.json());

            // 2. Fetch Users to calc Department Distribution
            const userRes = await fetch('/api/users');
            if (userRes.ok) {
                const users = await userRes.json();
                if (Array.isArray(users) && users.length > 0) {
                    const depts: Record<string, number> = {};
                    users.forEach((u: any) => {
                        const d = u.department || 'Unassigned';
                        depts[d] = (depts[d] || 0) + 1;
                    });

                    const total = users.length;
                    const dist = Object.keys(depts).map((d, i) => {
                        const colors = ['bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-blue-500', 'bg-pink-500'];
                        return {
                            name: d,
                            percent: Math.round((depts[d] / total) * 100),
                            color: colors[i % colors.length]
                        };
                    }).sort((a, b) => b.percent - a.percent);
                    setDeptDistribution(dist);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/api/reports/detailed?date=${selectedDate}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setAttendanceLogs(data);
            }
        } catch (e) { console.error(e); }
    };

    const handleExportPDF = () => {
        setGenerating(true);
        setTimeout(() => {
            window.print();
            setGenerating(false);
        }, 500);
    };

    const downloadCSV = () => {
        if (attendanceLogs.length === 0) return toast.error('No data to export');

        const headers = ['Employee', 'Department', 'Manager', 'Status', 'Date', 'Clock In', 'Clock Out', 'Leave Type', 'Leave Reason'];
        const rows = attendanceLogs.map(log => [
            log.employee.name,
            log.employee.department || 'N/A',
            log.manager,
            log.status,
            selectedDate,
            log.attendance.clockIn ? format(new Date(log.attendance.clockIn), 'HH:mm') : '-',
            log.attendance.clockOut ? format(new Date(log.attendance.clockOut), 'HH:mm') : '-',
            log.leave.type || '-',
            log.leave.reason || '-'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detailed_report_${selectedDate}.csv`;
        a.click();
    };

    const handleStartCycle = () => {
        toast.success(`New Payroll Cycle Started for ${cycleMonth}! Notifications sent to managers.`);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20 print:bg-white print:p-0">
            <div className="flex items-center gap-3 mb-6 print:hidden">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">HR Comprehensive Reports</h1>
                </div>

                <div className="flex items-center gap-2 mr-4">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Date:</span>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm"
                    />
                </div>

                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('summary')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'summary' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Summary
                    </button>
                    <button
                        onClick={() => setViewMode('sheet')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'sheet' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                    >
                        Detailed View
                    </button>
                </div>

                <button onClick={handleExportPDF} disabled={generating} className="text-[#135bec] font-bold text-sm flex items-center gap-1 ml-2">
                    {generating ? '...' : <><span className="material-symbols-outlined text-lg">print</span> Print</>}
                </button>
                <button onClick={downloadCSV} className="text-[#135bec] font-bold text-sm flex items-center gap-1 ml-2">
                    <span className="material-symbols-outlined text-lg">download</span> CSV
                </button>
            </div>

            {viewMode === 'summary' ? (
                <div className="grid grid-cols-1 gap-6">
                    {/* Payroll Cycle Card */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 print:border-black">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Payroll Management</h3>
                        <p className="text-sm text-slate-500 mb-4">Current Cycle: <span className="font-bold text-green-600">Active - Nov 2025</span></p>

                        <button
                            onClick={() => router.push('/hr/payroll')}
                            className="w-full bg-[#135bec] text-white font-bold p-3 rounded-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 print:hidden"
                        >
                            <span className="material-symbols-outlined">payments</span>
                            Process Payroll
                        </button>
                    </div>

                    {/* Avg Attendance Grid (Real Data) */}
                    <div className="grid grid-cols-2 gap-3 print:break-inside-avoid">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 print:border-black">
                            <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase print:text-black">Avg Attendance</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1 print:text-black">{attendanceStats.avgAttendance}%</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 print:border-black">
                            <p className="text-red-600 dark:text-red-400 text-xs font-bold uppercase print:text-black">Absent Today</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1 print:text-black">{attendanceStats.absentToday}</p>
                        </div>
                    </div>

                    {/* Department Distribution (Real Data) */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 print:break-inside-avoid">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Department Distribution</h3>
                        <div className="flex flex-col gap-3">
                            {deptDistribution.length === 0 ? (
                                <p className="text-sm text-slate-500">No data available.</p>
                            ) : deptDistribution.map((dept, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700 dark:text-slate-300 capitalize">{dept.name}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{dept.percent}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 print:border print:border-black">
                                        <div className={`${dept.color} h-2 rounded-full print:bg-black`} style={{ width: `${dept.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attrition Reference */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 print:break-inside-avoid">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Attrition Rate (Reference)</h3>
                        <div className="h-40 flex items-end justify-between gap-2 px-2">
                            {[30, 45, 25, 60, 40, 50, 65, 30, 45, 55, 40, 35].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative group print:bg-slate-200">
                                    <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-[#135bec] rounded-t-sm print:bg-black"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase">
                            <span>Jan</span>
                            <span>Jun</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden print:border-black">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white">Daily Detailed Status Report</h3>
                        <span className="text-sm font-bold text-slate-500">{format(new Date(selectedDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Manager</th>
                                    <th className="px-4 py-3">Dept</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Clock In / Out</th>
                                    <th className="px-4 py-3">Leave Info</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-4 text-center text-slate-500">No records found.</td>
                                    </tr>
                                ) : attendanceLogs.map((log) => (
                                    <tr key={log._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 print:border-black">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900 dark:text-white">{log.employee.name}</p>
                                            <p className="text-xs text-slate-500">{log.employee.role} | {log.employee.position || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 font-medium">
                                            {log.manager}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{log.employee.department || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${log.status === 'Working' ? 'bg-green-100 text-green-700' :
                                                log.status === 'On Leave' ? 'bg-purple-100 text-purple-700' :
                                                    log.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {log.attendance.clockIn ? (
                                                <div className="flex flex-col text-xs">
                                                    <span className="text-green-600 font-bold">In: {format(new Date(log.attendance.clockIn), 'HH:mm')}</span>
                                                    {log.attendance.clockOut && <span className="text-red-500 font-bold">Out: {format(new Date(log.attendance.clockOut), 'HH:mm')}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">
                                            {log.leave.type ? (
                                                <div>
                                                    <p className="font-bold text-slate-700 dark:text-slate-300 capitalize">{log.leave.type} Leave</p>
                                                    <p className="text-slate-400 italic truncate max-w-[150px]">{log.leave.reason}</p>
                                                </div>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Start Cycle Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-up">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start New Cycle</h3>
                        <p className="text-slate-500 mb-4 text-sm">Create payroll tasks for:</p>

                        <input
                            type="text"
                            value={cycleMonth}
                            onChange={e => setCycleMonth(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700 dark:text-white mb-4 font-bold"
                        />

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl">Cancel</button>
                            <button onClick={handleStartCycle} className="flex-1 py-3 text-white font-bold bg-[#135bec] rounded-xl hover:bg-blue-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
