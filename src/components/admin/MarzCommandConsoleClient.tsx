'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Activity,
  ShieldCheck,
  DollarSign,
  Globe,
  Server,
  Cpu,
  AlertTriangle,
  Lock,
  Loader2,
  Mic,
  Radio,
} from 'lucide-react';
import { io, type Socket } from 'socket.io-client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export function MarzCommandConsoleClient({ authorizedEmail }: { authorizedEmail: string }) {
  const [logs, setLogs] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: '[MARZ]: System Online. Ready to architect your digital presence.',
      timestamp: new Date().toISOString(),
    },
    {
      role: 'system',
      content: '[MARZ]: Neural Protocol initialized. Monitoring system health...',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [systemHealth, setSystemHealth] = useState(98);
  const [activeUsers, setActiveUsers] = useState(142);
  const [revenueToday, setRevenueToday] = useState(1250);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const neuralCoreSocketRef = useRef<Socket | null>(null);

  const appendLog = (message: ChatMessage) => {
    setLogs((prev) => [...prev, message]);
  };

  const sendCommand = async (commandText: string) => {
    const normalized = commandText.trim();
    if (!normalized) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: normalized,
      timestamp: new Date().toISOString(),
    };

    appendLog(userMessage);
    setInputValue('');
    setIsProcessing(true);

    try {
      const socket = neuralCoreSocketRef.current;
      if (socket && socketReady) {
        const socketResponse = await new Promise<{ content?: string; text?: string; timestamp?: string; isError?: boolean } | null>((resolve) => {
          const timer = setTimeout(() => resolve(null), 1200);
          socket.emit(
            'neural-core-command',
            {
              message: normalized,
              history: logs.slice(-10),
            },
            (ack: { content?: string; text?: string; timestamp?: string; isError?: boolean } | null) => {
              clearTimeout(timer);
              resolve(ack);
            }
          );
        });

        if (socketResponse && (socketResponse.content || socketResponse.text)) {
          appendLog({
            role: 'assistant',
            content: String(socketResponse.content || socketResponse.text || ''),
            timestamp: socketResponse.timestamp || new Date().toISOString(),
            isError: Boolean(socketResponse.isError),
          });
          return;
        }
      }

      const response = await fetch('/api/marz/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: normalized,
          history: logs.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp,
        isError: data.isError,
      };
      appendLog(assistantMessage);
    } catch (error) {
      const errorContent = `⚠️ NEURAL LINK DEGRADED\nError: ${error instanceof Error ? error.message : String(error)}\nMARZ is attempting recovery...`;
      appendLog({
        role: 'system',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth((health) => Math.min(100, Math.max(95, health + (Math.random() - 0.45))));
      setActiveUsers((users) => users + (Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0));
      if (Math.random() > 0.8) {
        setRevenueToday((rev) => rev + 49);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const neuralCoreUrl = process.env.NEXT_PUBLIC_NEURAL_CORE_URL;
    if (!neuralCoreUrl) {
      setSocketReady(false);
      return;
    }

    const socket = io(neuralCoreUrl, {
      transports: ['websocket'],
      timeout: 3000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    neuralCoreSocketRef.current = socket;

    socket.on('connect', () => {
      setSocketReady(true);
      appendLog({
        role: 'system',
        content: '[MARZ]: Neural Core bridge connected. Commands routing over low-latency stream.',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('connect_error', () => {
      setSocketReady(false);
      appendLog({
        role: 'system',
        content: '[MARZ]: Neural Core bridge unavailable. Reverting to REST command path.',
        timestamp: new Date().toISOString(),
        isError: true,
      });
    });

    socket.on('disconnect', () => {
      setSocketReady(false);
    });

    socket.on('neural-core-stream', (payload: { content?: string; text?: string; timestamp?: string; isError?: boolean } | string) => {
      const content = typeof payload === 'string' ? payload : String(payload?.content || payload?.text || '').trim();
      if (!content) {
        return;
      }

      appendLog({
        role: 'assistant',
        content,
        timestamp: typeof payload === 'string' ? new Date().toISOString() : payload.timestamp || new Date().toISOString(),
        isError: typeof payload === 'string' ? false : Boolean(payload.isError),
      });
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('neural-core-stream');
      socket.disconnect();
      neuralCoreSocketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-NZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim();
      if (!transcript) {
        return;
      }

      setInputValue(transcript);
      void sendCommand(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      appendLog({
        role: 'system',
        content: '[MARZ]: Voice command capture failed. Switch to chat input and retry.',
        timestamp: new Date().toISOString(),
        isError: true,
      });
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
      }
      recognitionRef.current = null;
    };
  }, []);

  const handleActivateMarz = async () => {
    if (isActivating) {
      return;
    }

    setIsActivating(true);
    appendLog({
      role: 'system',
      content: '[MARZ]: Activation sequence initiated...',
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await fetch('/api/marz/neural-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text: 'Welcome, Ajay. Command console online.',
          gen_text: 'Welcome, Ajay. Command console online.',
          prompt: 'Deliver a concise activation greeting for Ajay.',
          firstLink: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Activation failed: ${response.status}`);
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      const engine = response.headers.get('x-marz-engine') || 'hybrid';
      const marzTextHeader = response.headers.get('x-marz-text');

      if (contentType.includes('application/json')) {
        const payload = (await response.json().catch(() => null)) as { text?: string } | null;
        const text = payload?.text || (marzTextHeader ? decodeURIComponent(marzTextHeader) : 'Activation complete.');
        appendLog({
          role: 'system',
          content: `[MARZ]: ${text} [engine=${engine}]`,
          timestamp: new Date().toISOString(),
        });
      } else {
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        try {
          const audio = new Audio(audioUrl);
          await audio.play();
        } catch {
        } finally {
          setTimeout(() => URL.revokeObjectURL(audioUrl), 3000);
        }
        const spokenText = marzTextHeader ? decodeURIComponent(marzTextHeader) : 'Activation complete.';
        appendLog({
          role: 'system',
          content: `[MARZ]: ${spokenText} [engine=${engine}]`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      appendLog({
        role: 'system',
        content: `[MARZ]: Activation degraded. ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleVoiceCommand = () => {
    if (!voiceSupported || isListening) {
      return;
    }

    try {
      setIsListening(true);
      recognitionRef.current?.start();
      appendLog({
        role: 'system',
        content: '[MARZ]: Listening for voice command...',
        timestamp: new Date().toISOString(),
      });
    } catch {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!inputValue.trim() || isProcessing) {
      return;
    }
    await sendCommand(inputValue);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] font-mono text-white relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 h-125 w-125 rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/40 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute h-3 w-3 animate-ping rounded-full bg-green-500" />
            <div className="relative h-3 w-3 rounded-full bg-green-500" />
          </div>
          <h1 className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold tracking-widest text-transparent">
            MARZ_OPERATOR // <span className="text-base font-normal uppercase text-white">GOD_MODE</span>
          </h1>
          <span className={`inline-flex items-center rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${socketReady ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-amber-400/40 bg-amber-500/10 text-amber-200'}`}>
            Neural Core {socketReady ? 'Live' : 'Fallback'}
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-2 font-bold">
            <Lock className="h-4 w-4 text-green-500" /> SECURE CONN: {authorizedEmail}
          </span>
          <span className="flex items-center gap-2">
            <Server className="h-4 w-4" /> HOSTING: ONLINE
          </span>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> OPENPROVIDER: CONNECTED
          </span>
        </div>
      </header>

      <main className="relative z-10 grid h-[calc(100vh-80px)] grid-cols-12 gap-6 p-6">
        <div className="col-span-3 flex flex-col gap-6">
          <MetricCard icon={<Activity className="text-green-400" />} label="SYSTEM INTEGRITY" value={`${systemHealth}%`} trend="+0.2%" />
          <MetricCard icon={<Cpu className="text-blue-400" />} label="ACTIVE NODES (USERS)" value={activeUsers.toString()} trend="+12 this hour" />
          <MetricCard icon={<DollarSign className="text-yellow-400" />} label="REVENUE (24H)" value={`$${revenueToday}`} trend="Stripe Webhook Active" />

          <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-4 text-xs uppercase tracking-wider text-slate-500">Emergency Overrides</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-4 py-2 text-left text-sm font-bold uppercase tracking-tighter text-red-400 transition-colors hover:bg-red-500/20">
                <AlertTriangle className="h-4 w-4" /> PURGE CACHE (ALL)
              </button>
              <button className="flex w-full items-center gap-2 rounded border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-left text-sm font-bold uppercase tracking-tighter text-blue-400 transition-colors hover:bg-blue-500/20">
                <ShieldCheck className="h-4 w-4" /> ROTATE API KEYS
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-6 flex flex-col">
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-[0_0_50px_-10px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                <Terminal className="h-4 w-4" /> LIVE NEURAL LOGS
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleActivateMarz}
                  disabled={isActivating}
                  className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                >
                  {isActivating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3" />} Activate MARZ
                </button>
                <div className="h-2 w-2 rounded-full bg-red-500/50" />
                <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <div className="h-2 w-2 rounded-full bg-green-500/50" />
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              <AnimatePresence>
                {logs.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`whitespace-pre-wrap border-l-2 pl-3 ${
                      message.isError
                        ? 'border-red-500 text-red-300'
                        : message.role === 'user'
                          ? 'border-yellow-500 text-yellow-300'
                          : 'border-blue-500 text-blue-100'
                    }`}
                  >
                    {message.content}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 border-l-2 border-cyan-500 pl-3 text-cyan-400"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  MARZ is processing...
                </motion.div>
              )}

              <div ref={logsEndRef} />
              {!isProcessing && <div className="animate-pulse text-xs text-cyan-500">Ready for input_</div>}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 bg-white/5 p-4">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Command MARZ (e.g., 'Run diagnostics' or 'Check OpenProvider status')..."
                className="flex-1 border-none bg-transparent text-white outline-none placeholder:text-slate-600"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={handleVoiceCommand}
                disabled={!voiceSupported || isProcessing || isListening}
                className="rounded border border-cyan-500/50 bg-cyan-600/20 px-3 py-2 text-cyan-300 transition-all hover:bg-cyan-600/35 disabled:opacity-50"
                aria-label="Voice command"
                title={voiceSupported ? 'Speak command' : 'Voice command not supported in this browser'}
              >
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-emerald-300' : ''}`} />
              </button>
              <button
                type="submit"
                disabled={isProcessing || !inputValue.trim()}
                className="rounded border border-cyan-500/50 bg-cyan-600/30 px-4 py-2 font-bold text-cyan-300 transition-all hover:bg-cyan-600/50 disabled:opacity-50"
              >
                {isProcessing ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-6">
          <div className="relative h-1/2 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Globe className="h-4 w-4" /> GLOBAL TRAFFIC
            </h3>
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="h-32 w-32 animate-ping rounded-full border-4 border-cyan-500/30" />
            </div>
            <div className="relative z-10 mt-12 text-center">
              <div className="text-2xl font-bold uppercase tracking-widest text-white">NZ, AU, US</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Top Regions Active</div>
            </div>
          </div>

          <div className="h-1/2 rounded-xl border border-blue-500/20 bg-linear-to-b from-blue-900/20 to-black p-4">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
              <Server className="h-4 w-4" /> RECENT DOMAINS
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between font-bold text-slate-300">
                <span> crypto - safe.nz</span>
                <span className="text-green-400">ACTIVE</span>
              </li>
              <li className="flex justify-between font-bold text-slate-300">
                <span> dental - pro.com</span>
                <span className="text-yellow-400">PENDING</span>
              </li>
              <li className="flex justify-between font-bold text-slate-300">
                <span> agency - flow.io</span>
                <span className="text-green-400">ACTIVE</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}

function MetricCard({ icon, label, value, trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10">
      <div className="mb-2 flex items-start justify-between">
        {icon}
        <span className="text-xs font-bold uppercase text-slate-500">{trend}</span>
      </div>
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="font-sans text-3xl font-bold tracking-tighter text-white">{value}</div>
    </div>
  );
}