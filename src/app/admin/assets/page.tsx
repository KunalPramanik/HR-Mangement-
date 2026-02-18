'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AssetManagementPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);

    const [users, setUsers] = useState<any[]>([]); // New State for Users Dropdown

    const [formData, setFormData] = useState({
        name: '',
        type: 'Laptop',
        serialNumber: '',
        model: '',
        status: 'Available',
        assignedTo: '', // New Field
        purchaseDate: '',
        cost: '',
        condition: 'New'
    });

    useEffect(() => {
        fetchAssets();
        fetchUsers(); // Fetch users on mount
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data && data.users ? data.users : []);
        } catch (e) {
            console.error('Failed to fetch users', e);
        }
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/assets${searchTerm ? `?search=${searchTerm}` : ''}`);
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingAsset ? `/api/assets` : '/api/assets';
            const method = editingAsset ? 'PUT' : 'POST';
            const body = editingAsset ? { ...formData, id: editingAsset._id } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingAsset ? 'Asset updated' : 'Asset created');
                setShowModal(false);
                setEditingAsset(null);
                setFormData({
                    name: '',
                    type: 'Laptop',
                    serialNumber: '',
                    model: '',
                    status: 'Available',
                    assignedTo: '',
                    purchaseDate: '',
                    cost: '',
                    condition: 'New'
                });
                fetchAssets();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const res = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Asset deleted');
                fetchAssets();
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting asset');
        }
    };

    const openEdit = (asset: any) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name,
            type: asset.type,
            serialNumber: asset.serialNumber,
            model: asset.model || '',
            status: asset.status,
            assignedTo: asset.assignedTo?._id || asset.assignedTo || '',
            purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
            cost: asset.cost || '',
            condition: asset.condition || 'New'
        });
        setShowModal(true);
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Asset Management</h1>
                    <p className="text-slate-500 mt-1">Track and manage company assets.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAsset(null);
                        setFormData({
                            name: '',
                            type: 'Laptop',
                            serialNumber: '',
                            model: '',
                            status: 'Available',
                            assignedTo: '',
                            purchaseDate: '',
                            cost: '',
                            condition: 'New'
                        });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    <span className="material-symbols-outlined">add</span>
                    Add New Asset
                </button>
            </div>

            <div className="mb-6 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                    type="text"
                    placeholder="Search by name or serial number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
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
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Serial / Model</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Condition</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {assets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No assets found.
                                    </td>
                                </tr>
                            ) : (
                                assets.map(asset => (
                                    <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {asset.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {asset.type}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div>{asset.serialNumber}</div>
                                            <div className="text-xs text-slate-400">{asset.model}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                                    asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {asset.status}
                                            </span>
                                            {asset.assignedTo && <div className="text-xs text-slate-500 mt-1">→ {asset.assignedTo.firstName}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {asset.condition}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(asset)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(asset._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:hover:bg-slate-700 transition">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Asset Name *</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none">
                                        {['Laptop', 'Monitor', 'Accessory', 'Furniture', 'Vehicle', 'License', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Serial Number *</label>
                                    <input required value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Model</label>
                                    <input value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Date *</label>
                                    <input type="date" required value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cost</label>
                                    <input type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none">
                                        {['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                {formData.status === 'Assigned' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Assign To *</label>
                                        <select
                                            value={formData.assignedTo}
                                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none"
                                        >
                                            <option value="">Select Employee</option>
                                            {users.map(u => (
                                                <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                                    <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full px-4 py-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 border-slate-200 outline-none">
                                        {['New', 'Good', 'Fair', 'Poor'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-4">
                                {editingAsset ? 'Update Asset' : 'Create Asset'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
