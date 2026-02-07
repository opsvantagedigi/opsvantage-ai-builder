'use client';

interface AuditLogListProps {
    logs: any[];
}

export function AuditLogList({ logs }: AuditLogListProps) {
    if (!logs || logs.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                No logs found.
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-slate-900">
                            {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-2">
                        <span>By {log.actor.name || log.actor.email}</span>
                        <span>•</span>
                        <span>{log.entityType}: {log.entityId}</span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                            <summary className="text-[10px] text-blue-600 cursor-pointer uppercase tracking-wider font-semibold">View Details</summary>
                            <pre className="mt-1 p-2 bg-slate-900 text-slate-100 text-[10px] rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            ))}
        </div>
    );
}
