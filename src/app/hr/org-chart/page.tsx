'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OrgNode {
    user: any;
    children: OrgNode[];
}

export default function OrgChartPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const focusId = searchParams.get('focus');
    const [tree, setTree] = useState<OrgNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await fetch('/api/users');
                if (!res.ok) throw new Error('Failed to load chart');
                const rawUsers = await res.json();
                const users = Array.isArray(rawUsers) ? rawUsers : rawUsers.users || [];

                // Build Tree
                const userMap = new Map();
                users.forEach((u: any) => userMap.set(u._id, { user: u, children: [] }));

                const roots: OrgNode[] = [];

                users.forEach((u: any) => {
                    const node = userMap.get(u._id);
                    if (u.managerId && userMap.has(u.managerId)) {
                        userMap.get(u.managerId).children.push(node);
                    } else {
                        // If no manager or manager not in list (e.g. CEO), they are root
                        roots.push(node);
                    }
                });

                if (focusId && userMap.has(focusId)) {
                    // Start from focus ID upwards to simulate a focused view? 
                    // Or just show the tree containing the focus ID?
                    // For now, simple full tree
                }

                setTree(roots);
            } catch (error) {
                toast.error('Failed to load organization chart');
            } finally {
                setLoading(false);
            }
        };

        fetchOrg();
    }, [focusId]);

    const renderNode = (node: OrgNode) => (
        <div key={node.user._id} className="flex flex-col items-center">
            {/* Node Card */}
            <div
                className={`
                    relative p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center gap-2 min-w-[200px] z-10 transition-all hover:scale-105 hover:shadow-md cursor-pointer
                    ${focusId === node.user._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}
                `}
                onClick={() => router.push(`/profile/${node.user._id}`)}
            >
                {node.user.profilePicture ? (
                    <img src={node.user.profilePicture} alt="" className="size-12 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                    <div className="size-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {node.user.firstName?.[0]}{node.user.lastName?.[0]}
                    </div>
                )}

                <div className="text-center">
                    <h3 className="font-bold text-gray-900 text-sm">{node.user.firstName} {node.user.lastName}</h3>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">{node.user.position || node.user.role}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{node.user.department}</p>
                </div>

                {/* Status Indicator */}
                <div className={`absolute top-2 right-2 size-2 rounded-full ${node.user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} title={node.user.isActive ? 'Active' : 'Inactive'}></div>
            </div>

            {/* Connector Line If Children */}
            {node.children.length > 0 && (
                <>
                    <div className="h-8 w-px bg-gray-300"></div>

                    {/* Children Container */}
                    <div className="flex gap-8 relative">
                        {/* Horizontal connector bar across children */}
                        {node.children.length > 1 && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] h-px bg-gray-300 z-0"></div>
                        )}

                        {/* Render Children Recursively */}
                        {node.children.map((child, index) => (
                            <div key={child.user._id} className="flex flex-col items-center relative">
                                {/* Vertical line from horizontal bar to child */}
                                <div className="h-8 w-px bg-gray-300 mb-0"></div>
                                {/* Correction: The horizontal bar logic is tricky in pure flex. 
                                    Better approach: Use a dedicated 'tree-connector' structure.
                                    Let's simplify visual: just lines for now.
                                */}
                                {renderNode(child)}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    // Better Recursive Renderer with correct connecting lines
    const TreeRenderer = ({ node }: { node: OrgNode }) => {
        return (
            <div className="flex flex-col items-center">
                {/* 1. The Card */}
                <div
                    className={`
                        relative p-4 rounded-xl border bg-white shadow-sm flex flex-col items-center justify-center min-w-[200px] z-10 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group mb-8
                        ${focusId === node.user._id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200'}
                    `}
                    onClick={() => router.push(`/profile/${node.user._id}`)}
                >
                    {node.user.profilePicture ? (
                        <img src={node.user.profilePicture} alt="" className="size-16 rounded-full object-cover border-4 border-white shadow-sm mb-3" />
                    ) : (
                        <div className="size-16 rounded-full bg-linear-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-sm mb-3">
                            {node.user.firstName?.[0]}{node.user.lastName?.[0]}
                        </div>
                    )}

                    <div className="text-center">
                        <h3 className="font-bold text-gray-900 text-lg">{node.user.firstName} {node.user.lastName}</h3>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{node.user.position}</p>
                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-[10px] font-medium text-gray-500 border border-gray-100">{node.user.department}</span>
                    </div>

                    {/* Status Dot */}
                    <div className={`absolute top-4 right-4 size-2.5 rounded-full border-2 border-white ${node.user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>

                {/* 2. Children Connection Lines */}
                {node.children.length > 0 && (
                    <div className="relative flex justify-center">
                        {/* Vertical line down from parent */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-8 w-px bg-gray-300"></div>

                        <div className="flex gap-8">
                            {node.children.map((child, index) => (
                                <div key={child.user._id} className="flex flex-col items-center relative">
                                    {/* Vertical line UP from child to horizontal bar */}
                                    <div className="h-8 w-px bg-gray-300 absolute -top-8 left-1/2 -translate-x-1/2"></div>

                                    {/* Horizontal connector logic */}
                                    {node.children.length > 1 && (
                                        <div className={`
                                            absolute -top-8 h-px bg-gray-300
                                            ${index === 0 ? 'left-1/2 w-1/2' : ''} 
                                            ${index === node.children.length - 1 ? 'right-1/2 w-1/2' : ''}
                                            ${index > 0 && index < node.children.length - 1 ? 'w-full left-0' : ''}
                                        `}></div>
                                    )}

                                    <TreeRenderer node={child} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full min-h-screen overflow-x-auto bg-[#f8f9fa]">
            <div className="p-8 pb-0">
                <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Organization Chart</h1>
                <p className="text-[#6b7280] font-medium">Visual hierarchy of the organization.</p>
            </div>

            <div className="flex-1 p-8 pt-0 overflow-auto flex justify-center items-start min-w-max">
                {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="size-16 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                ) : tree.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">account_tree</span>
                        <p className="text-gray-500 font-medium">No structure found based on manager assignments.</p>
                        <p className="text-sm text-gray-400 mt-2">Make sure employees have managers assigned in their profiles.</p>
                    </div>
                ) : (
                    <div className="flex gap-16">
                        {tree.map(root => (
                            <TreeRenderer key={root.user._id} node={root} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
