'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function TestComponentsPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('Idle');

    const simulateAction = (type: 'success' | 'error') => {
        setLoading(true);
        setStatus('Processing...');
        setTimeout(() => {
            setLoading(false);
            if (type === 'success') {
                setStatus('Action Succeeded! ✅');
            } else {
                setStatus('Action Failed! ❌ (Simulated Error)');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-slate-800 dark:text-slate-100">
            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                        System Test Suite
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Visual Validation for Components, States, and Error Handling.
                    </p>
                </header>

                {/* SECTION 1: BUTTONS & VARIANTS */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                        1. Button Components (All Types)
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="w-24 text-sm font-medium text-slate-400">Variants:</span>
                            <Button variant="primary">Primary Action</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="danger">Danger Zone</Button>
                            <Button variant="success">Success</Button>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="w-24 text-sm font-medium text-slate-400">Sizes:</span>
                            <Button size="sm" variant="primary">Small</Button>
                            <Button size="md" variant="primary">Medium (Default)</Button>
                            <Button size="lg" variant="primary">Large Button</Button>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="w-24 text-sm font-medium text-slate-400">States:</span>
                            <Button isLoading variant="primary">Loading</Button>
                            <Button disabled variant="primary">Disabled</Button>
                            <Button variant="outline" leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}>
                                With Icon
                            </Button>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: FUNCTIONAL TESTING (Working vs Not Working) */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                        2. Functional States (Working vs Error)
                    </h2>

                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                                <h3 className="font-medium text-lg">Process Simulator</h3>
                                <p className="text-sm text-slate-500">Test how the UI handles success and failure states.</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg font-mono text-sm">
                                Status: <span className={status.includes('Success') ? 'text-green-500' : status.includes('Failed') ? 'text-red-500' : 'text-blue-500'}>{status}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="success"
                                onClick={() => simulateAction('success')}
                                isLoading={loading}
                            >
                                Test "Working" Flow
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => simulateAction('error')}
                                isLoading={loading}
                            >
                                Test "Not Working" Flow
                            </Button>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: NAVIGATION & 404 */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
                        3. Edge Cases (404 & Missing)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/this-page-does-not-exist-123" target="_blank" className="block">
                            <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-orange-500">broken_image</span>
                                    <h3 className="font-bold group-hover:text-blue-600 transition-colors">Test 404 Page</h3>
                                </div>
                                <p className="text-sm text-slate-500">Clicking this will navigate to a non-existent route to verify the custom 404 UI.</p>
                            </div>
                        </Link>

                        <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-slate-400">lock</span>
                                <h3 className="font-bold text-slate-500">Unauthorized (403)</h3>
                            </div>
                            <p className="text-sm text-slate-500">Requires specific role setup to test (See API Tests).</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
