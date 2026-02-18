'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Loader2,
  Mic,
  Radio,
} from 'lucide-react';

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
  const logsEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
    return;
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
    <div className="font-mono text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
          <Terminal className="h-4 w-4" /> MARZ Operator Console
          <span className="ml-2 inline-flex items-center rounded border border-slate-700 bg-slate-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200">
            REST Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleActivateMarz}
            disabled={isActivating}
            className="inline-flex items-center gap-1 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isActivating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3" />} Activate
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1 text-xs text-slate-400">
          <div>Secure: {authorizedEmail}</div>
          <div>Health: {systemHealth}% • Active: {activeUsers} • Revenue: ${revenueToday}</div>
        </div>

        <div className="custom-scrollbar max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-slate-800/70 bg-black/40 p-4 text-sm">
          <AnimatePresence>
            {logs.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`whitespace-pre-wrap border-l-2 pl-3 ${
                  message.isError
                    ? 'border-red-500 text-red-200'
                    : message.role === 'user'
                      ? 'border-amber-400 text-amber-200'
                      : 'border-cyan-500 text-slate-100'
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
              className="flex items-center gap-2 border-l-2 border-cyan-500 pl-3 text-cyan-200"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              MARZ is processing...
            </motion.div>
          )}

          <div ref={logsEndRef} />
          {!isProcessing && <div className="animate-pulse text-xs text-slate-500">Ready for input…</div>}
        </div>

        <form onSubmit={handleSendMessage} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Command MARZ…"
            className="min-w-[220px] flex-1 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={handleVoiceCommand}
            disabled={!voiceSupported || isProcessing || isListening}
            className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-200 hover:bg-slate-900/40 disabled:opacity-50"
            aria-label="Voice command"
            title={voiceSupported ? 'Speak command' : 'Voice command not supported in this browser'}
          >
            <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-emerald-300' : ''}`} />
          </button>
          <button
            type="submit"
            disabled={isProcessing || !inputValue.trim()}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isProcessing ? '…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}