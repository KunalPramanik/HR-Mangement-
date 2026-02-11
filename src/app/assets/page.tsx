'use client';

import { useState } from 'react';

export default function AssetsPage() {
    const [view, setView] = useState('list'); // 'list' or 'grid'
    const [filter, setFilter] = useState('All');

    // Mock Data
    const assets = [
        { id: 'AST-001', name: 'MacBook Pro 16"', type: 'Laptop', serial: 'C02D1234F', status: 'Assigned', assignee: 'Sarah Jenkins', condition: 'Good' },
        { id: 'AST-002', name: 'Dell XPS 15', type: 'Laptop', serial: '8H23G22', status: 'Available', assignee: '-', condition: 'New' },
        { id: 'AST-003', name: 'iPhone 14', type: 'Mobile', serial: 'IMEI332211', status: 'Assigned', assignee: 'James Wilson', condition: 'Good' },
        { id: 'AST-004', name: 'Herman Miller Chair', type: 'Furniture', serial: 'HM-9922', status: 'Assigned', assignee: 'Elena Rodriguez', condition: 'Fair' },
        { id: 'AST-005', name: 'Magic Mouse', type: 'Peripheral', serial: 'MM-221', status: 'Available', assignee: '-', condition: 'Good' },
    ];

    const filteredAssets = filter === 'All' ? assets : assets.filter(a => a.status === filter);

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">Asset Inventory</h1>
                    <p className="text-[#6b7280] font-medium">Track and manage company equipment lifecycle.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => alert('Scanner module not connected. Please attach a barcode scanner.')}
                        className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-600 font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">qr_code_scanner</span>
                        Scan
                    </button>
                    <button
                        onClick={() => {
                            const name = prompt('Enter Asset Name:');
                            if (name) alert(`Asset "${name}" added to inventory successfully.`);
                        }}
                        className="px-6 py-3 rounded-full bg-[#3b82f6] text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:bg-[#2563eb] transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add Asset
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="soft-card p-6 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">devices</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Total Assets</p>
                        <h3 className="text-2xl font-extrabold text-[#111827]">142</h3>
                    </div>
                </div>
                <div className="soft-card p-6 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined">assignment_ind</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Assigned</p>
                        <h3 className="text-2xl font-extrabold text-[#111827]">118</h3>
                    </div>
                </div>
                <div className="soft-card p-6 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Available</p>
                        <h3 className="text-2xl font-extrabold text-[#111827]">21</h3>
                    </div>
                </div>
                <div className="soft-card p-6 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined">build</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500">Maintenance</p>
                        <h3 className="text-2xl font-extrabold text-[#111827]">3</h3>
                    </div>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center justify-between overflow-x-auto pb-2">
                <div className="flex gap-2">
                    {['All', 'Assigned', 'Available', 'Maintenance', 'Retired'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === f ? 'bg-[#111827] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-100 hidden md:flex">
                    <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-100 text-[#111827]' : 'text-gray-400'}`}>
                        <span className="material-symbols-outlined">format_list_bulleted</span>
                    </button>
                    <button onClick={() => setView('grid')} className={`p-2 rounded-md ${view === 'grid' ? 'bg-gray-100 text-[#111827]' : 'text-gray-400'}`}>
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                </div>
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="soft-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="p-4">Name</th>
                                <th className="p-4">Serial #</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Assignee</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                            {filteredAssets.map((asset) => (
                                <tr key={asset.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-[#111827]">{asset.name}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">{asset.serial}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold">{asset.type}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit
                                            ${asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            <span className="size-1.5 rounded-full bg-current"></span>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 flex items-center gap-2">
                                        {asset.assignee !== '-' && (
                                            <div className="size-6 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                                                {asset.assignee.split(' ')[0][0]}{asset.assignee.split(' ')[1][0]}
                                            </div>
                                        )}
                                        {asset.assignee}
                                    </td>
                                    <td className="p-4">
                                        <button className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Grid View */}
            {view === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map((asset) => (
                        <div key={asset.id} className="soft-card p-6 flex flex-col gap-4 relative group">
                            <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full 
                                ${asset.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                            `}>
                                {asset.status}
                            </div>
                            <div className="size-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                                <span className="material-symbols-outlined">{asset.type === 'Laptop' ? 'laptop' : asset.type === 'Mobile' ? 'smartphone' : 'category'}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#111827]">{asset.name}</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">{asset.serial}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 text-sm">
                                <p className="text-gray-500 text-xs font-bold mb-1">ASSIGNED TO</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    {asset.assignee !== '-' && (
                                        <div className="size-6 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center font-bold">
                                            {asset.assignee.split(' ')[0][0]}{asset.assignee.split(' ')[1][0]}
                                        </div>
                                    )}
                                    {asset.assignee}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
