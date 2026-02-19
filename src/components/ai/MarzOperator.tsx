'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHasMounted } from '@/hooks/useHasMounted';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const MarzOperator = () => {
  const hasMounted = useHasMounted();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversationLog, setConversationLog] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!hasMounted) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + transcript + ' ');
            processVoiceCommand(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [hasMounted]);

  const processVoiceCommand = (command: string) => {
    if (!hasMounted) return;
    
    const lowerCommand = command.toLowerCase().trim();
    
    // Add to conversation log
    setConversationLog(prev => [...prev, `User: ${command}`, `MARZ: Processing command...`]);
    
    // Navigation commands
    if (lowerCommand.includes('show ssl') || lowerCommand.includes('ssl options')) {
      router.push('/services/ssl');
      setConversationLog(prev => [...prev, `MARZ: Navigating to SSL options page.`]);
    } else if (lowerCommand.includes('show me services') || lowerCommand.includes('go to services')) {
      router.push('/services');
      setConversationLog(prev => [...prev, `MARZ: Navigating to services page.`]);
    } else if (lowerCommand.includes('neural wheel') || lowerCommand.includes('spin wheel')) {
      router.push('/neural-wheel');
      setConversationLog(prev => [...prev, `MARZ: Navigating to Neural Wheel.`]);
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('admin panel')) {
      router.push('/dashboard');
      setConversationLog(prev => [...prev, `MARZ: Navigating to dashboard.`]);
    } else if (lowerCommand.includes('home') || lowerCommand.includes('main page')) {
      router.push('/');
      setConversationLog(prev => [...prev, `MARZ: Navigating to home page.`]);
    } else {
      setConversationLog(prev => [...prev, `MARZ: Command "${command}" not recognized.`]);
    }
  };

  const toggleListening = () => {
    if (!hasMounted) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      // Add final transcript to conversation log
      if (transcript.trim()) {
        setConversationLog(prev => [...prev, `User: ${transcript}`]);
        setTranscript('');
      }
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const downloadBlueprint = () => {
    if (!hasMounted) return;
    
    const blueprintContent = `# MARZ Build Blueprint\n\n## Conversation Log\n${conversationLog.join('\n')}\n\n## Generated on: ${new Date().toISOString()}`;
    const blob = new Blob([blueprintContent], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marz-build-blueprint.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!hasMounted) {
    // Render an empty div with the same structure to prevent hydration mismatch
    return <div className="fixed bottom-6 right-6 z-50" />;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg rounded-xl p-4 mb-4 w-80 shadow-2xl border border-cyan-500/30">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-cyan-400 font-bold">MARZ Operator</h3>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-3 h-32 overflow-y-auto bg-gray-800 rounded p-2 text-sm">
            {conversationLog.length > 0 ? (
              conversationLog.map((entry, index) => (
                <p key={index} className={`${entry.startsWith('MARZ:') ? 'text-cyan-300' : 'text-gray-300'} mb-1`}>
                  {entry}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">No conversation yet...</p>
            )}
          </div>
          
          <div className="flex items-center mb-3">
            <button
              onClick={toggleListening}
              className={`flex-1 py-2 px-4 rounded-lg font-medium mr-2 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            
            <button
              onClick={downloadBlueprint}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium"
            >
              Download Blueprint
            </button>
          </div>
          
          {transcript && (
            <div className="text-sm text-gray-300 bg-gray-800 p-2 rounded">
              <strong>Current:</strong> {transcript}
            </div>
          )}
        </div>
      )}
      
      {/* Floating Zenith Orb */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isListening 
            ? 'animate-pulse bg-gradient-to-r from-cyan-500 to-amber-500' 
            : 'bg-gradient-to-r from-cyan-600 to-amber-600'
        }`}
        aria-label="MARZ Operator"
      >
        <span className="text-white font-bold text-xl">M</span>
      </button>
    </div>
  );
};

export default MarzOperator;