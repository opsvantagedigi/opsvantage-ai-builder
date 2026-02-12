import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';

// Server Component for admin validation
async function validateAdminAccess() {
  const session = await getServerSession(authOptions);
  const authorizedEmails = ['ajay.sidal@opsvantagedigital.online']; // Add your admin emails
  
  if (!session || !authorizedEmails.includes(session.user?.email || '')) {
    redirect('/login?error=Unauthorized');
  }
  
  return session;
}

// Server Component for the main admin page
export default async function MarzConsolePage() {
  // Validate admin access server-side
  await validateAdminAccess();
  
  // Get initial metrics data
  const initialMetrics = {
    neuralActivity: Math.floor(Math.random() * 100),
    dataFlow: Math.floor(Math.random() * 1000),
    systemHealth: 100,
    connections: Math.floor(Math.random() * 50) + 10
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-green-400 font-mono p-6">
      <div className="max-w-7xl mx-auto">
        <header className="border-b border-green-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-green-300">
            MARZ OPERATIONAL DASHBOARD
          </h1>
          <p className="text-green-600 mt-2">Neural Network Status Monitoring Interface</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="NEURAL ACTIVITY" 
            value={`${initialMetrics.neuralActivity}%`} 
            status={initialMetrics.neuralActivity > 70 ? 'high' : initialMetrics.neuralActivity > 30 ? 'medium' : 'low'} 
          />
          <MetricCard 
            title="DATA FLOW" 
            value={`${initialMetrics.dataFlow} GB/s`} 
            status="normal" 
          />
          <MetricCard 
            title="SYSTEM HEALTH" 
            value={`${Math.round(initialMetrics.systemHealth)}%`} 
            status={initialMetrics.systemHealth > 80 ? 'good' : initialMetrics.systemHealth > 50 ? 'warning' : 'critical'} 
          />
          <MetricCard 
            title="CONNECTIONS" 
            value={initialMetrics.connections.toString()} 
            status="normal" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-green-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-300 mb-4">NEURAL PATHWAYS</h2>
            <div className="h-64 bg-black/50 rounded p-4 font-mono text-sm overflow-auto">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="mb-1">
                  <span className="text-green-600">[PATHWAY]</span> {`neural_${i + 1}.core`} - <span className="text-green-400">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 border border-green-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-300 mb-4">SYSTEM LOGS</h2>
            <div className="h-64 bg-black/50 rounded p-4 font-mono text-sm overflow-auto">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="mb-1">
                  <span className="text-gray-500">[2026-02-{String(10 + i).padStart(2, '0')} 14:{String(30 + i).padStart(2, '0')}:0{i}]</span> 
                  <span className="ml-2 text-yellow-400">INFO:</span> Neural pathway {i + 1} operational
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-green-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-300 mb-4">ADMIN CONTROLS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ControlButton label="INITIATE DIAGNOSTICS" color="blue" />
            <ControlButton label="RESET NEURAL NET" color="yellow" />
            <ControlButton label="EMERGENCY SHUTDOWN" color="red" />
          </div>
        </div>
      </div>
      
      {/* Client-side script for dynamic updates */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Client-side metrics updates would go here
          // But the main authorization is handled server-side
        `
      }} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  status: 'high' | 'medium' | 'low' | 'good' | 'warning' | 'critical' | 'normal';
}

function MetricCard({ title, value, status }: MetricCardProps) {
  let statusColor = '';
  switch (status) {
    case 'high':
    case 'good':
      statusColor = 'text-green-400';
      break;
    case 'medium':
    case 'warning':
      statusColor = 'text-yellow-400';
      break;
    case 'low':
    case 'critical':
      statusColor = 'text-red-400';
      break;
    default:
      statusColor = 'text-green-400';
  }

  return (
    <div className="bg-gray-800/50 border border-green-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${statusColor}`}>{value}</p>
      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${statusColor.replace('text-', 'bg-')}`} style={{width: '70%'}}></div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  color: 'blue' | 'yellow' | 'red';
}

function ControlButton({ label, color }: ControlButtonProps) {
  let bgColor = '';
  let hoverColor = '';
  
  switch (color) {
    case 'blue':
      bgColor = 'bg-blue-600';
      hoverColor = 'hover:bg-blue-700';
      break;
    case 'yellow':
      bgColor = 'bg-yellow-600';
      hoverColor = 'hover:bg-yellow-700';
      break;
    case 'red':
      bgColor = 'bg-red-600';
      hoverColor = 'hover:bg-red-700';
      break;
  }

  return (
    <button className={`${bgColor} ${hoverColor} text-white py-3 px-4 rounded-lg transition-colors font-bold`}>
      {label}
    </button>
  );
}