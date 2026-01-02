'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    _id: string;
    content: string;
    senderId: {
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    role?: string;
    createdAt: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
}

export default function MessagesPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [targetType, setTargetType] = useState<'users' | 'role'>('users');
    const [targetId, setTargetId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
        fetchUsers();
    }, []);

    const fetchMessages = async () => {
        const res = await fetch('/api/messages');
        if (res.ok) setMessages(await res.json());
        setLoading(false);
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/users');
        if (res.ok) setUsers(await res.json());
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage || !targetId) return;

        const payload: any = { content: newMessage };
        if (targetType === 'users') {
            payload.receiverId = targetId;
        } else {
            payload.role = targetId;
        }

        const res = await fetch('/api/messages', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setNewMessage('');
            fetchMessages();
        }
    };

    const canBroadcast = ['admin', 'hr', 'director', 'manager'].includes(session?.user?.role || '');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row pb-20 md:pb-0 h-screen overflow-hidden">
            {/* Sidebar / Compose Area (Mobile Top, Desktop Left) */}
            <div className="w-full md:w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-10">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <button onClick={() => router.back()} className="md:hidden p-2 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined">arrow_back</span></button>
                    <h1 className="font-bold text-xl">Messages</h1>
                </div>

                <div className="p-4 overflow-y-auto flex-1 md:flex-initial">
                    <h2 className="text-xs font-bold uppercase text-slate-500 mb-3">Compose New</h2>
                    <form onSubmit={handleSend} className="flex flex-col gap-3">
                        <select
                            value={targetType}
                            onChange={e => { setTargetType(e.target.value as any); setTargetId(''); }}
                            className="p-2 rounded border bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-sm"
                        >
                            <option value="users">Direct Message</option>
                            {canBroadcast && <option value="role">Broadcast to Role</option>}
                        </select>

                        <select
                            value={targetId}
                            onChange={e => setTargetId(e.target.value)}
                            className="p-2 rounded border bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-sm"
                            required
                        >
                            <option value="">Select Recipient...</option>
                            {targetType === 'users' ? (
                                users.map(u => (
                                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>
                                ))
                            ) : (
                                <>
                                    <option value="all">All Employees</option>
                                    <option value="manager">Managers</option>
                                    <option value="hr">HR Team</option>
                                    <option value="employee">Employees</option>
                                </>
                            )}
                        </select>

                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="p-2 rounded border bg-slate-50 dark:bg-slate-700 dark:border-slate-600 text-sm min-h-[80px]"
                            required
                        />

                        <button type="submit" className="bg-[#135bec] text-white py-2 rounded font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">send</span> Send
                        </button>
                    </form>
                </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 backdrop-blur sticky top-0">
                    <h2 className="font-bold text-slate-700 dark:text-slate-200">Inbox</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {loading ? (
                        <div className="text-center p-10 text-slate-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center p-10 flex flex-col items-center text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-2">chat_bubble_outline</span>
                            <p>No messages yet.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm max-w-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {msg.senderId?.firstName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm text-slate-900 dark:text-white block">
                                                {msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : 'Unknown'}
                                                {msg.role && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">to {msg.role}</span>}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
