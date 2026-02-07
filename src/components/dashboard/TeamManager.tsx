'use client';

import React, { useEffect, useState } from 'react';

interface Member {
    id: string;
    role: string;
    user: {
        name: string | null;
        email: string | null;
    };
}

interface TeamManagerProps {
    workspaceId: string;
    currentUserId: string;
}

export function TeamManager({ workspaceId, currentUserId }: TeamManagerProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = async () => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/members`);
            if (!res.ok) throw new Error('Failed to fetch members');
            const data = await res.json();
            setMembers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [workspaceId]);

    const handleRemove = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const res = await fetch(`/api/workspace/${workspaceId}/members`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove member');
            }

            setMembers(members.filter((m) => m.id !== memberId));
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-4 text-slate-500">Loading team...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Team Management</h3>
                    <p className="text-sm text-slate-500">Manage who has access to this workspace.</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Invite Member
                </button>
            </div>
            <div className="divide-y divide-slate-100">
                {members.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                {member.user.name?.[0] || member.user.email?.[0] || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{member.user.name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-500">{member.user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${member.role === 'OWNER' ? 'bg-purple-50 text-purple-600' :
                                    member.role === 'ADMIN' ? 'bg-blue-50 text-blue-600' :
                                        'bg-slate-50 text-slate-600'
                                }`}>
                                {member.role}
                            </span>
                            {member.user.email !== currentUserId && member.role !== 'OWNER' && (
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
