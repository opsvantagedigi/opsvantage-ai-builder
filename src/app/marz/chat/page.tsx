'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mic, Video, VideoOff, Volume2, VolumeX, Send, Power, Sparkles, Wifi, WifiOff } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  videoUrl?: string;
  audioUrl?: string;
};

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export default function MARZChatPage() {
  const searchParams = useSearchParams();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [latestVideoUrl, setLatestVideoUrl] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Add message to chat
  const addMessage = useCallback((role: 'user' | 'assistant', text: string, videoUrl?: string, audioUrl?: string) => {
    setMessages(prev => [...prev, {
      id: `${role}-${Date.now()}`,
      role,
      text,
      timestamp: new Date(),
      videoUrl,
      audioUrl,
    }]);
  }, []);

  // Send message
  const sendMessage = useCallback((text: string) => {
    const messageText = text.trim();
    if (!messageText) {
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addMessage('user', messageText);
      addMessage('assistant', 'MARZ is currently offline. Please reconnect.');
      return;
    }

    addMessage('user', messageText);

    const recentHistory = messages.slice(-8).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    wsRef.current.send(JSON.stringify({
      text: messageText,
      request_id: `chat-${Date.now()}`,
      history: recentHistory,
      enable_video: isVideoEnabled,
    }));

    setInputText('');
  }, [addMessage, isVideoEnabled, messages]);

  const requestAwakeningVideo = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      request_id: `wake-${Date.now()}`,
      awakening: true,
      text: 'Awaken MARZ. Sovereign user requesting connection.',
      client: 'marz-pwa-mobile',
      ts: Date.now(),
      enable_video: true,
    }));
  }, []);
  
  // Wake on mount if requested
  useEffect(() => {
    const wakeOnMount = searchParams.get('wake') === 'true';
    const videoOnMount = searchParams.get('video') === 'true';
    
    if (wakeOnMount || videoOnMount) {
      connectToMARZ();
    }
    
    if (videoOnMount) {
      setIsVideoEnabled(true);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled((prev) => {
      const next = !prev;
      if (next) {
        requestAwakeningVideo();
      }
      return next;
    });
  }, [requestAwakeningVideo]);

  useEffect(() => {
    if (!isVideoEnabled || !latestVideoUrl || !videoRef.current) {
      return;
    }

    if (videoRef.current.src !== latestVideoUrl) {
      videoRef.current.src = latestVideoUrl;
      void videoRef.current.play().catch(() => {
        // Autoplay can be blocked; user interaction may be required.
      });
    }
  }, [isVideoEnabled, latestVideoUrl]);
  
  // Check for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);
  
  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setLastTranscript(finalTranscript || interimTranscript);
          
          // Process voice commands
          if (finalTranscript) {
            processVoiceCommand(finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          const errorLabel = typeof event?.error === 'string' ? event.error : 'unknown';
          addMessage('assistant', `Voice recognition error: ${errorLabel}.`);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, [addMessage]);
  
  // Process voice commands
  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Wake commands
    if (lowerCommand.includes('hey marz') || lowerCommand.includes('ok marz') || lowerCommand.includes('wake up marz')) {
      connectToMARZ();
      addMessage('assistant', 'I\'m here. How can I help you?');
      return;
    }
    
    // Video commands
    if (lowerCommand.includes('turn on video') || lowerCommand.includes('enable video')) {
      setIsVideoEnabled(true);
      addMessage('assistant', 'Enabling video...');
      return;
    }
    
    if (lowerCommand.includes('turn off video') || lowerCommand.includes('disable video')) {
      setIsVideoEnabled(false);
      addMessage('assistant', 'Disabling video...');
      return;
    }
    
    // Audio commands
    if (lowerCommand.includes('mute') || lowerCommand.includes('turn off audio')) {
      setIsAudioEnabled(false);
      addMessage('assistant', 'Muting audio...');
      return;
    }
    
    if (lowerCommand.includes('unmute') || lowerCommand.includes('turn on audio')) {
      setIsAudioEnabled(true);
      addMessage('assistant', 'Unmuting audio...');
      return;
    }
    
    // Stop commands
    if (lowerCommand.includes('stop') || lowerCommand.includes('goodbye') || lowerCommand.includes('bye')) {
      disconnectFromMARZ();
      addMessage('assistant', 'Until next time. Sovereignty awaits.');
      return;
    }
    
    // If no command matched, send as message
    sendMessage(command);
  }, [addMessage, sendMessage]);
  
  // Connect to MARZ WebSocket
  const connectToMARZ = useCallback(async () => {
    setConnectionStatus('connecting');
    
    try {
      const preferSecure = typeof window !== 'undefined'
        ? window.location.protocol === 'https:' || process.env.NODE_ENV === 'production'
        : process.env.NODE_ENV === 'production';

      const enforceWsProtocol = (rawUrl: string) => {
        try {
          const url = new URL(rawUrl);
          if (preferSecure) {
            url.protocol = 'wss:';
          } else if (url.protocol === 'http:' || url.protocol === 'https:') {
            url.protocol = 'ws:';
          }
          return url.toString();
        } catch {
          if (preferSecure && rawUrl.startsWith('ws://')) {
            return `wss://${rawUrl.slice('ws://'.length)}`;
          }
          if (!preferSecure && rawUrl.startsWith('wss://')) {
            return `ws://${rawUrl.slice('wss://'.length)}`;
          }
          return rawUrl;
        }
      };

      const ensureNeuralCorePath = (rawUrl: string) => {
        if (!rawUrl) {
          return rawUrl;
        }

        try {
          const url = new URL(rawUrl);
          const hasEndpoint = url.pathname && url.pathname !== '/' && url.pathname !== '';
          if (!hasEndpoint) {
            url.pathname = '/ws/neural-core';
          }
          return url.toString();
        } catch {
          if (rawUrl.includes('/ws/neural-core')) {
            return rawUrl;
          }

          const trimmed = rawUrl.replace(/\/+$/, '');
          return `${trimmed}/ws/neural-core`;
        }
      };

      const candidate = process.env.NEXT_PUBLIC_NEURAL_CORE_WS_URL || process.env.NEXT_PUBLIC_NEURAL_CORE_URL || '';
      const withEndpoint = ensureNeuralCorePath(candidate);
      const withProtocol = enforceWsProtocol(withEndpoint);
      const wsUrl = withProtocol || 'wss://marz-neural-core-xge3xydmha-ez.a.run.app/ws/neural-core';
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        
        // Send awakening message
        ws.send(JSON.stringify({
          request_id: `wake-${Date.now()}`,
          awakening: true,
          text: 'Awaken MARZ. Sovereign user requesting connection.',
          client: 'marz-pwa-mobile',
          ts: Date.now(),
          enable_video: isVideoEnabled,
        }));
        
        addMessage('assistant', 'MARZ is online. I\'m listening.');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'error') {
            setConnectionStatus('error');
            addMessage('assistant', `MARZ error: ${data.message || 'Unknown neural-core error.'}`);
            return;
          }

          if (data.type === 'status' && !data.video_b64 && !data.audio_b64 && !data.text) {
            return;
          }

          let latestVideoUrl: string | undefined;
          let latestAudioUrl: string | undefined;
          
          if (data.video_b64) {
            const videoFormat = String(data.video_format || '').toLowerCase();
            const videoMimeType = videoFormat === 'mp4' ? 'video/mp4' : 'video/webm';
            const videoBlob = base64ToBlob(data.video_b64, videoMimeType);
            const videoUrl = URL.createObjectURL(videoBlob);
            setLatestVideoUrl(videoUrl);
            latestVideoUrl = videoUrl;
            
            if (videoRef.current) {
              videoRef.current.src = videoUrl;
              void videoRef.current.play().catch((playError) => {
                console.error('Video playback failed:', playError);
              });
            }
          }
          
          if (data.audio_b64) {
            const audioFormat = String(data.audio_format || '').toLowerCase();
            const audioMimeType = audioFormat === 'wav' ? 'audio/wav' : 'audio/mpeg';
            const audioBlob = base64ToBlob(data.audio_b64, audioMimeType);
            const audioUrl = URL.createObjectURL(audioBlob);
            latestAudioUrl = audioUrl;
            
            if (audioRef.current && isAudioEnabled) {
              audioRef.current.src = audioUrl;
              void audioRef.current.play().catch((playError) => {
                console.error('Audio playback failed:', playError);
              });
              setIsSpeaking(true);
              
              audioRef.current.onended = () => {
                setIsSpeaking(false);
              };
            }
          }
          
          if (data.text) {
            addMessage('assistant', data.text, latestVideoUrl, latestAudioUrl);
            return;
          }

          if (latestVideoUrl) {
            addMessage('assistant', 'Video stream received.', latestVideoUrl, latestAudioUrl);
            return;
          }

          if (latestAudioUrl) {
            addMessage('assistant', 'Audio response received.', undefined, latestAudioUrl);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      
      ws.onerror = () => {
        setConnectionStatus('error');
        addMessage('assistant', 'Connection error: unable to reach MARZ Neural Core. If you just deployed, wait 60–120s for cold start and try again.');
      };
      
      ws.onclose = () => {
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  }, [addMessage, isAudioEnabled, isVideoEnabled]);
  
  // Disconnect from MARZ
  const disconnectFromMARZ = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionStatus('disconnected');
    
    setIsVideoEnabled(false);
  }, []);
  
  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      addMessage('assistant', 'Voice commands are not supported on this browser. Use Chrome/Edge or type your message.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (startError) {
        console.error('Speech recognition start failed:', startError);
        addMessage('assistant', 'Unable to start voice recognition. Check microphone permission and try again.');
      }
    }
  }, [addMessage, isListening]);
  
  // Handle install PWA
  const handleInstall = useCallback(() => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    });
  }, [deferredPrompt]);
  
  // Helper: Base64 to Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col">
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
            connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' :
            'bg-slate-500'
          }`} />
          <h1 className="text-lg font-semibold text-cyan-400">MARZ</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <Wifi className="w-5 h-5 text-emerald-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </header>
      
      {/* Video Stream */}
      {isVideoEnabled && (
        <div className="relative aspect-video bg-slate-900">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-cyan-400">
            MARZ Live
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-cyan-500/50" />
            <p className="text-lg font-medium">MARZ is ready</p>
            <p className="text-sm mt-2">Say &quot;Hey MARZ&quot; or tap the microphone to start</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-60">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-slate-800 border border-cyan-500/30 rounded-xl p-4 shadow-xl">
          <p className="text-sm text-slate-200 mb-3">
            Install MARZ for quick access and offline support
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-cyan-600 text-white py-2 rounded-lg text-sm font-medium"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-slate-700 text-slate-200 py-2 rounded-lg text-sm font-medium"
            >
              Later
            </button>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="border-t border-cyan-500/20 bg-slate-900/80 p-4 safe-area-bottom">
        {/* Voice transcription */}
        {isListening && lastTranscript && (
          <div className="mb-3 p-3 bg-slate-800/80 rounded-xl border border-cyan-500/20">
            <p className="text-sm text-cyan-400 italic">&quot;{lastTranscript}&quot;</p>
          </div>
        )}
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="mb-3 flex items-center justify-center gap-2 text-cyan-400">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm">MARZ is speaking...</span>
          </div>
        )}
        
        {/* Input and controls */}
        <div className="flex items-center gap-3">
          {/* Voice button */}
          <button
            onClick={toggleListening}
            className={`p-4 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
          
          {/* Text input */}
          <input
            type="text"
            id="marz-chat-input"
            name="marzChatInput"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          
          {/* Send button */}
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
            className="p-3 bg-cyan-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Additional controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-full transition-all ${
              isAudioEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          <button
            onClick={connectionStatus === 'connected' ? disconnectFromMARZ : connectToMARZ}
            className={`p-3 rounded-full transition-all ${
              connectionStatus === 'connected'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
