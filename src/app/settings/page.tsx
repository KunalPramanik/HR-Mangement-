'use client';

import { useState } from 'react';

import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#111827] mb-2">System Settings</h1>
                    <p className="text-[#6b7280] font-medium">Configure global application preferences.</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="px-6 py-3 rounded-full bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/30 flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Theme Settings */}
                <div className="soft-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined">palette</span>
                        </div>
                        <h3 className="font-bold text-[#111827]">Appearance</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-gray-700 font-medium">Light Mode</span>
                            <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} className="accent-blue-600 size-4" />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-gray-700 font-medium">Dark Mode</span>
                            <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="accent-blue-600 size-4" />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-gray-700 font-medium">System Default</span>
                            <input type="radio" name="theme" checked={theme === 'system'} onChange={() => setTheme('system')} className="accent-blue-600 size-4" />
                        </label>
                    </div>
                </div>

                {/* Notifications */}
                <div className="soft-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                            <span className="material-symbols-outlined">notifications</span>
                        </div>
                        <h3 className="font-bold text-[#111827]">Notifications</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium text-sm">Enable Push Notifications</span>
                            <div
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`size-4 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium text-sm">Email Alerts</span>
                            <div className="w-12 h-6 rounded-full p-1 cursor-pointer bg-green-500 transition-colors">
                                <div className="size-4 bg-white rounded-full shadow-md transform translate-x-6 transition-transform"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium text-sm">SMS Updates</span>
                            <div className="w-12 h-6 rounded-full p-1 cursor-pointer bg-gray-300 transition-colors">
                                <div className="size-4 bg-white rounded-full shadow-md transform translate-x-0 transition-transform"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="soft-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined">security</span>
                        </div>
                        <h3 className="font-bold text-[#111827]">Security</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => alert('Password reset link sent to your email.')}
                            className="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">key</span>
                            Change Password
                        </button>
                        <button
                            onClick={() => alert('2FA setup requires mobile verification.')}
                            className="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            Two-Factor Authentication
                        </button>
                        <button
                            onClick={() => { if (confirm('Are you sure you want to log out of all other sessions?')) alert('Logged out successfully from other devices.'); }}
                            className="w-full py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 mt-auto"
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            Log Out All Devices
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
