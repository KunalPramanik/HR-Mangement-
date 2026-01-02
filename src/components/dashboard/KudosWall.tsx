'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserBasic {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    position?: string;
}

interface IKudos {
    _id: string;
    fromUserId: UserBasic;
    toUserId: UserBasic;
    message: string;
    badge: string;
    createdAt: string;
}

const BADGES = [
    { name: 'Star', icon: '⭐', color: 'bg-yellow-100 text-yellow-600', label: 'Rising Star' },
    { name: 'Team Player', icon: '🤝', color: 'bg-blue-100 text-blue-600', label: 'Team Player' },
    { name: 'Innovator', icon: '💡', color: 'bg-purple-100 text-purple-600', label: 'Innovator' },
    { name: 'Hard Worker', icon: '💪', color: 'bg-orange-100 text-orange-600', label: 'Hard Worker' },
    { name: 'Leader', icon: '👑', color: 'bg-red-100 text-red-600', label: 'Leadership' },
    { name: 'Problem Solver', icon: '🧩', color: 'bg-green-100 text-green-600', label: 'Problem Solver' }
];

export default function KudosWall() {
    const { data: session } = useSession();
    const [kudosList, setKudosList] = useState<IKudos[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState<UserBasic[]>([]);

    // Form State
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedBadge, setSelectedBadge] = useState(BADGES[0].name);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchKudos();
        fetchUsers();
    }, []);

    const fetchKudos = async () => {
        try {
            const res = await fetch('/api/kudos');
            if (res.ok) setKudosList(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users'); // Assuming this returns all users
            if (res.ok) {
                const data = await res.json();
                // Filter out self
                if (session?.user?.id) {
                    setUsers(data.filter((u: any) => u._id !== session.user.id));
                } else {
                    setUsers(data);
                }
            }
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !message) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/kudos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toUserId: selectedUser,
                    badge: selectedBadge,
                    message
                })
            });

            if (res.ok) {
                setShowModal(false);
                setMessage('');
                setSelectedUser('');
                fetchKudos(); // Refresh list
            } else {
                alert('Failed to send kudos');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">trophy</span>
                    Wall of Fame
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="text-sm font-bold text-[#135bec] hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                >
                    + Give Kudos
                </button>
            </div>

            {/* Horizontal Scroll List */}
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                {kudosList.length === 0 ? (
                    <div className="w-full p-6 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200">
                        No kudos yet. Be the first to recognize a colleague!
                    </div>
                ) : (
                    kudosList.map((kudos) => {
                        const badgeInfo = BADGES.find(b => b.name === kudos.badge) || BADGES[0];
                        return (
                            <div key={kudos._id} className="min-w-[280px] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 snap-center relative overflow-hidden group hover:shadow-md transition-all">
                                {/* Decor */}
                                <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-xl ${badgeInfo.color} opacity-20 group-hover:opacity-100 transition-opacity`}>
                                    {badgeInfo.icon}
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                        {kudos.toUserId.profilePicture ? (
                                            <img src={kudos.toUserId.profilePicture} alt={kudos.toUserId.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                                {kudos.toUserId.firstName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{kudos.toUserId.firstName} {kudos.toUserId.lastName}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">{badgeInfo.label}</p>
                                    </div>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 text-sm italic mb-4 line-clamp-3">"{kudos.message}"</p>

                                <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 dark:border-slate-700 pt-3">
                                    <span>From:</span>
                                    <span className="font-semibold text-slate-600 dark:text-slate-400">{kudos.fromUserId.firstName} {kudos.fromUserId.lastName}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Give Kudos</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* User Select */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Who are you celebrating?</label>
                                <select
                                    value={selectedUser}
                                    onChange={e => setSelectedUser(e.target.value)}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                                    required
                                >
                                    <option value="">Select a colleague...</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.position || 'Employee'})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Badge Select */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Badge</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {BADGES.map(b => (
                                        <div
                                            key={b.name}
                                            onClick={() => setSelectedBadge(b.name)}
                                            className={`cursor-pointer p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedBadge === b.name
                                                    ? `border-[#135bec] bg-blue-50 dark:bg-blue-900/20`
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                                }`}
                                        >
                                            <span className="text-2xl">{b.icon}</span>
                                            <span className="text-[10px] font-bold text-center leading-tight">{b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Thank you for..."
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[100px]"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#135bec] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Sending...' : 'Send Kudos ✨'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
