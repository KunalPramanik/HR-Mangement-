'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
}

interface Asset {
    _id: string;
    name: string;
    type: string;
    serialNumber: string;
    status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
    assignedTo?: User;
    condition: string;
    value?: number;
    notes?: string;
}

export default function AssetsPage() {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'Laptop',
        serialNumber: '',
        condition: 'New',
        value: 0,
        notes: ''
    });

    useEffect(() => {
        fetchAssets();
        fetchUsers();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            if (res.ok) setAssets(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) setUsers(await res.json());
        } catch (e) { console.error(e); }
    };

    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const handleEditAsset = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            type: asset.type,
            serialNumber: asset.serialNumber,
            condition: asset.condition,
            value: asset.value || 0,
            notes: asset.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingAsset ? 'PUT' : 'POST';
            const url = editingAsset ? `/api/assets/${editingAsset._id}` : '/api/assets';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingAsset(null);
                setFormData({ name: '', type: 'Laptop', serialNumber: '', condition: 'New', value: 0, notes: '' });
                fetchAssets();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save asset');
            }
        } catch (e) { console.error(e); }
    };

    // State for interactive features
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [assignModal, setAssignModal] = useState<{ open: boolean; assetId: string }>({ open: false, assetId: '' });

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAssign = async (assetId: string, userId: string) => {
        try {
            const res = await fetch(`/api/assets/${assetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Assigned', assignedTo: userId, assignedDate: new Date() })
            });
            if (res.ok) {
                setAssignModal({ open: false, assetId: '' });
                fetchAssets();
            }
        } catch (e) { console.error(e); }
    };

    const handleDeassign = async (assetId: string) => {
        if (!confirm('Are you sure you want to unassign this asset?')) return;
        try {
            const res = await fetch(`/api/assets/${assetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Available', assignedTo: null, assignedDate: null })
            });
            if (res.ok) fetchAssets();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (assetId: string) => {
        if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/assets/${assetId}`, { method: 'DELETE' });
            if (res.ok) fetchAssets();
        } catch (e) { console.error(e); }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700';
            case 'Assigned': return 'bg-blue-100 text-blue-700';
            case 'Maintenance': return 'bg-orange-100 text-orange-700';
            case 'Retired': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.assignedTo && `${a.assignedTo.firstName} ${a.assignedTo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">IT Asset Management</h1>
                    <p className="text-xs text-slate-500">Track computers, licenses & equipment</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#135bec] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span> Add Asset
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Assets</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{assets.length}</h3>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50">
                    <p className="text-xs font-bold text-green-600 uppercase">Available</p>
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {assets.filter(a => a.status === 'Available').length}
                    </h3>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <p className="text-xs font-bold text-blue-600 uppercase">Assigned</p>
                    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {assets.filter(a => a.status === 'Assigned').length}
                    </h3>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50">
                    <p className="text-xs font-bold text-orange-600 uppercase">Maintenance</p>
                    <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {assets.filter(a => a.status === 'Maintenance').length}
                    </h3>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 ml-2">search</span>
                <input
                    type="text"
                    placeholder="Search by name, serial, or user..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent p-2 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]"></div>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="text-center p-10 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200">
                    No assets found. Add one to get started!
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredAssets.map(asset => (
                        <div key={asset._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className={`size-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${asset.type === 'Laptop' ? 'bg-indigo-100 text-indigo-600' :
                                    asset.type === 'Mobile' ? 'bg-purple-100 text-purple-600' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    <span className="material-symbols-outlined">
                                        {asset.type === 'Laptop' ? 'computer' : asset.type === 'Mobile' ? 'smartphone' : 'devices'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{asset.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono">S/N: {asset.serialNumber}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(asset.status)}`}>
                                        {asset.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 flex-1">
                                {asset.assignedTo ? (
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Assigned To</p>
                                        <p className="font-bold text-slate-700 dark:text-white text-sm">{asset.assignedTo.firstName} {asset.assignedTo.lastName}</p>
                                        <p className="text-xs text-slate-500">{asset.assignedTo.employeeId}</p>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 italic">Unassigned</p>
                                    </div>
                                )}

                                {/* Action Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === asset._id ? null : asset._id)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                                    >
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>

                                    {openMenuId === asset._id && (
                                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden">
                                            {asset.status === 'Available' && (
                                                <button onClick={() => { setAssignModal({ open: true, assetId: asset._id }); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">person_add</span> Assign User
                                                </button>
                                            )}
                                            {asset.status === 'Assigned' && (
                                                <button onClick={() => { handleDeassign(asset._id); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">person_remove</span> Unassign
                                                </button>
                                            )}
                                            <button onClick={() => { handleEditAsset(asset); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">edit</span> Edit Details
                                            </button>
                                            <button onClick={() => { handleDelete(asset._id); setOpenMenuId(null); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">delete</span> Delete Asset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assign Modal */}
            {assignModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-xl animate-scale-up">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Assign Asset</h3>
                        <div className="mb-4 max-h-[300px] overflow-y-auto">
                            {users.map(u => (
                                <div
                                    key={u._id}
                                    onClick={() => handleAssign(assignModal.assetId, u._id)}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0"
                                >
                                    <div className="size-8 rounded-full bg-[#135bec] text-white flex items-center justify-center font-bold text-xs">{u.firstName[0]}</div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                        <p className="text-xs text-slate-500">{u.employeeId}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setAssignModal({ open: false, assetId: '' })} className="w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300">Cancel</button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Asset Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                        placeholder="e.g. MacBook Pro M3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    >
                                        <option value="Laptop">Laptop</option>
                                        <option value="Mobile">Mobile</option>
                                        <option value="Peripheral">Peripheral</option>
                                        <option value="License">License</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Serial Number</label>
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    placeholder="e.g. SN-2024-X99"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Condition</label>
                                    <select
                                        value={formData.condition}
                                        onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    >
                                        <option value="New">New</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Value (USD)</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-20"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-[#135bec] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                                {editingAsset ? 'Update Asset' : 'Create Asset'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
