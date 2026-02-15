"use client";

import Link from "next/link";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import MentorLog from "@/components/admin/MentorLog";
import { DashboardTaskList } from "@/components/admin/DashboardTaskList";
import { LegacyGuidebook } from "@/components/admin/LegacyGuidebook";
import { Fortune500Metrics } from "@/components/admin/Fortune500Metrics";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { DashboardFooter } from "@/components/admin/DashboardFooter";
import { MarzPresence } from "@/components/admin/MarzPresence";
import { MarzCommandConsoleClient } from "@/components/admin/MarzCommandConsoleClient";

type Thought = {
  category: string;
  insight: string;
  createdAt?: string;
};

type Telemetry = {
  generatedAt: string;
  sovereign25SlotsRemaining: number;
  openProviderStatus: "green" | "red";
  marzThoughts: Thought[];
};

type ImpactReport = {
  totals?: {
    totalSavingsUsd?: number;
  };
};

type JournalEntry = {
  category: string;
  insight: string;
  createdAt?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NeuralDashboardClient({
  initialThoughts,
  initialJournal,
}: {
  initialThoughts: Thought[];
  initialJournal: JournalEntry[];
}) {
  const pinnedWelcomeThought = "[WELCOME NOTE] Legacy of 2026: March 10, 2026 is our Dream Fulfillment Event. We build with grace, protect human dignity, and serve the less fortunate with resilient infrastructure.";
  const [mounted, setMounted] = React.useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [nzdSaved, setNzdSaved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [globalLaunchActive, setGlobalLaunchActive] = useState(false);
  const [switchBusy, setSwitchBusy] = useState(false);
  const [neuralLinkActive, setNeuralLinkActive] = useState(false);
  const [neuralLinkBusy, setNeuralLinkBusy] = useState(false);
  const [neuralLinkError, setNeuralLinkError] = useState<string | null>(null);
  const [neuralLinkStatus, setNeuralLinkStatus] = useState<"idle" | "active" | "degraded">("idle");
  const [neuralSpeech, setNeuralSpeech] = useState("Idle. MARZ awaiting Neural Link activation.");
  const [voiceModelLabel, setVoiceModelLabel] = useState("NZ-Aria");
  const [welcomePinned, setWelcomePinned] = useState(true);
  const [hasUrgentTask, setHasUrgentTask] = useState(false);
  const [marzIntroReady, setMarzIntroReady] = useState(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const telemetrySnapshotRef = useRef<string>("");
  const thoughtsSnapshotRef = useRef<string>(JSON.stringify(initialThoughts));
  const impactSnapshotRef = useRef<number>(0);
  const launchSnapshotRef = useRef<boolean>(false);
  const hasRedirectedRef = useRef(false);
  const hasEstablishedNeuralLinkRef = useRef(false);
  const hasAutoActivatedNeuralLinkRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  const pendingFallbackSpeechRef = useRef<string | null>(null);
  const [engineUpdatedAtLabel, setEngineUpdatedAtLabel] = useState(() => {
    return new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(new Date());
  });

  React.useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (process.env.NODE_ENV === "production") return;

    let isActive = true;

    const loadTelemetry = async () => {
      try {
        const response = await fetch("/api/admin/telemetry", { cache: "no-store" });
        if (response.status === 401 && !hasRedirectedRef.current) {
          const authProbe = await fetch("/api/admin/impact-report", { cache: "no-store" });
          if (authProbe.status === 401) {
            hasRedirectedRef.current = true;
            window.location.replace("/sovereign-access");
            return;
          }
        }

        if (!response.ok) return;
        const payload = (await response.json()) as Telemetry;
        if (!isActive) return;
        const telemetrySnapshot = JSON.stringify(payload);
        if (telemetrySnapshotRef.current !== telemetrySnapshot) {
          telemetrySnapshotRef.current = telemetrySnapshot;
          setTelemetry(payload);
        }

        const thoughtsSnapshot = JSON.stringify(payload.marzThoughts);
        if (thoughtsSnapshotRef.current !== thoughtsSnapshot) {
          thoughtsSnapshotRef.current = thoughtsSnapshot;
          setThoughts(payload.marzThoughts);
        }

        const impactResponse = await fetch("/api/admin/impact-report", { cache: "no-store" });
        if (impactResponse.ok) {
          const impactPayload = (await impactResponse.json()) as ImpactReport;
          const usd = impactPayload?.totals?.totalSavingsUsd ?? 0;
          const nzd = usd * 1.62;
          const rounded = Number(nzd.toFixed(2));
          if (impactSnapshotRef.current !== rounded) {
            impactSnapshotRef.current = rounded;
            setNzdSaved(rounded);
          }
        }

        const switchResponse = await fetch("/api/admin/kill-switch", { cache: "no-store" });
        if (switchResponse.ok) {
          const switchPayload = (await switchResponse.json()) as { globalLaunchActive?: boolean };
          const nextLaunchState = Boolean(switchPayload.globalLaunchActive);
          if (launchSnapshotRef.current !== nextLaunchState) {
            launchSnapshotRef.current = nextLaunchState;
            setGlobalLaunchActive(nextLaunchState);
          }
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadTelemetry();
    const interval = setInterval(() => {
      void loadTelemetry();
    }, 15000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    const seedDirective = async () => {
      try {
        const response = await fetch("/api/marz/seed-memory", {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }
      } catch {
      }
    };

    void seedDirective();

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  const thoughtLines = useMemo(() => {
    const computedLines = (thoughts ?? []).slice(0, 50).map((thought, index) => {
      const timestamp = thought.createdAt && typeof window !== "undefined"
        ? new Date(thought.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : `T+${index + 1}`;
      const normalizedCategory = (thought.category || "STRATEGY").toUpperCase();
      return `[${timestamp}] [${normalizedCategory}] ${thought.insight}`;
    });

    if (welcomePinned) {
      return [pinnedWelcomeThought, ...computedLines];
    }

    return computedLines;
  }, [pinnedWelcomeThought, thoughts, welcomePinned]);

  const appendAutonomousThought = React.useCallback((insight: string) => {
    setThoughts((prev) => {
      const next = [
        {
          category: "TASK",
          insight,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 50);

      thoughtsSnapshotRef.current = JSON.stringify(next);
      return next;
    });
  }, []);

  const currentPhaseLabel = useMemo(() => {
    const now = new Date();
    const phaseOneStart = new Date("2026-02-10T00:00:00Z").getTime();
    const phaseOneEnd = new Date("2026-02-20T23:59:59Z").getTime();
    const inPhaseOne = now.getTime() >= phaseOneStart && now.getTime() <= phaseOneEnd;
    return inPhaseOne ? "Phase 1: Visual Lockdown" : "Phase Tracking";
  }, []);

  const voiceEngineBadge = useMemo(() => {
    const normalizedLabel = voiceModelLabel.toLowerCase();
    if (normalizedLabel.includes("browser")) {
      return {
        label: "Engine: Browser Fallback",
        className: "border-amber-400/30 bg-amber-500/10 text-amber-200",
      };
    }

    if (normalizedLabel.includes("alltalk")) {
      return {
        label: "Engine: AllTalk XTTS v2",
        className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
      };
    }

    return {
      label: "Engine: Hybrid",
      className: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    };
  }, [voiceModelLabel]);

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat("en-NZ", {
      timeZone: "Pacific/Auckland",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(new Date());
    setEngineUpdatedAtLabel(formatted);
  }, [voiceModelLabel]);

  const stopLipSync = React.useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.onended = null;
      audioElementRef.current = null;
    }

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.disconnect();
      } catch {
      }
      audioSourceRef.current = null;
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
      }
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setNeuralLinkActive(false);
  }, []);

  const playNeuralSpeech = React.useCallback(
    async (audioBytes: Uint8Array) => {
      if (typeof window === "undefined") return;
      stopLipSync();

      // Create a copy of the buffer to ensure compatibility
      const copy = new Uint8Array(audioBytes.length);
      copy.set(audioBytes);
      const audioBlob = new Blob([copy], { type: "audio/mpeg" });
      if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
      const objectUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = objectUrl;

      const audioElement = new Audio(objectUrl);
      audioElementRef.current = audioElement;

      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        setNeuralLinkActive(false);
        return;
      }

      const audioContext = new AudioContextCtor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;

      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      audioSourceRef.current = source;
      analyserRef.current = analyser;

      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      const renderFrame = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(frequencyData);
        const average = frequencyData.reduce((sum, current) => sum + current, 0) / frequencyData.length;
        if (audioElementRef.current && !audioElementRef.current.paused && !audioElementRef.current.ended) {
          animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
      };

      audioElement.onended = () => {
        stopLipSync();
      };

      setNeuralLinkActive(true);
      await audioElement.play();
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    },
    [stopLipSync]
  );

  const playBrowserFallbackSpeech = React.useCallback((text: string) => {
    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      setNeuralLinkError("Speech unavailable in this browser.");
      return;
    }

    const trimmed = String(text || "").trim();
    if (!trimmed) {
      setNeuralLinkError("No speech text available.");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setNeuralLinkActive(true);
      };
      utterance.onend = () => {
        setNeuralLinkActive(false);
      };
      utterance.onerror = () => {
        setNeuralLinkActive(false);
        setNeuralLinkError("Speech unavailable in this browser.");
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setNeuralLinkActive(false);
      setNeuralLinkError("Speech unavailable in this browser.");
    }
  }, []);

  const requestFallbackSpeech = React.useCallback((text: string) => {
    if (hasUserInteractedRef.current) {
      playBrowserFallbackSpeech(text);
      return;
    }

    pendingFallbackSpeechRef.current = text;
  }, [playBrowserFallbackSpeech]);

  useEffect(() => {
    if (!mounted) return;

    const handleFirstInteraction = () => {
      hasUserInteractedRef.current = true;
      if (pendingFallbackSpeechRef.current) {
        playBrowserFallbackSpeech(pendingFallbackSpeechRef.current);
        pendingFallbackSpeechRef.current = null;
      }
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [mounted, playBrowserFallbackSpeech]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    const runHeartbeat = async () => {
      try {
        const response = await fetch("/api/marz/chat", { method: "GET", cache: "no-store", credentials: "include" });
        if (cancelled) return;
        setNeuralLinkStatus(response.ok ? "active" : "degraded");
      } catch {
        if (!cancelled) {
          setNeuralLinkStatus("degraded");
        }
      }
    };

    void runHeartbeat();
    const interval = setInterval(() => {
      void runHeartbeat();
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mounted]);

  const activateNeuralLink = React.useCallback(async (options?: {
    text?: string;
    prompt?: string;
    forceFirstLink?: boolean;
  }) => {
    setNeuralLinkBusy(true);
    setNeuralLinkError(null);

    try {
      const isFirstLink = options?.forceFirstLink ?? !hasEstablishedNeuralLinkRef.current;
      const inputText = options?.text || thoughtLines[0];
      const fallbackSpeechText = "Neural Link Established. System online.";
      const safeSpeechText = String(inputText || fallbackSpeechText);
      const promptSeed = options?.prompt
        ? options.prompt
        : thoughtLines[0]
          ? `Using this latest neural thought, speak a grounded update: ${thoughtLines[0]}`
          : "Provide a grounded operational update for today.";
      const configuredNeuralLinkEndpoint = process.env.NEXT_PUBLIC_NEURAL_LINK_ENDPOINT;
      let neuralLinkEndpoint = "/api/marz/neural-link";

      if (configuredNeuralLinkEndpoint) {
        if (configuredNeuralLinkEndpoint.startsWith("/")) {
          neuralLinkEndpoint = configuredNeuralLinkEndpoint;
        } else if (typeof window !== "undefined") {
          try {
            const parsed = new URL(configuredNeuralLinkEndpoint, window.location.origin);
            if (parsed.origin === window.location.origin) {
              neuralLinkEndpoint = `${parsed.pathname}${parsed.search}${parsed.hash}`;
            }
          } catch {
            neuralLinkEndpoint = "/api/marz/neural-link";
          }
        }
      }

      const response = await fetch(neuralLinkEndpoint, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: safeSpeechText,
          voice: "NZ-Aria",
          gen_text: safeSpeechText,
          prompt: promptSeed,
          firstLink: isFirstLink,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null;
        throw new Error(payload?.details || payload?.error || "Neural Link activation failed.");
      }

      const engine = response.headers.get("x-marz-engine");
      const speechHeader = response.headers.get("x-marz-text");
      const responseContentType = (response.headers.get("content-type") || "").toLowerCase();
      setHasUrgentTask(false);

      if (responseContentType.includes("application/json")) {
        const payload = (await response.json().catch(() => null)) as { text?: string; warning?: string } | null;
        hasEstablishedNeuralLinkRef.current = true;
        setVoiceModelLabel("Browser TTS Fallback");
        setNeuralLinkActive(false);
        setNeuralLinkError(null);
        if (payload?.text) {
          setNeuralSpeech(payload.text);
        } else if (speechHeader) {
          setNeuralSpeech(decodeURIComponent(speechHeader));
        }
        const fallbackText = payload?.text || (speechHeader ? decodeURIComponent(speechHeader) : "");
        if (fallbackText) {
          playBrowserFallbackSpeech(fallbackText);
        } else if (payload?.warning) {
          setNeuralLinkError(payload.warning);
        }
        return;
      }

      const audioBuffer = await response.arrayBuffer();

      hasEstablishedNeuralLinkRef.current = true;
      setVoiceModelLabel(engine === "alltalk" ? "AllTalk" : engine === "edge-tts" ? "Edge-TTS" : "Hybrid");
      if (speechHeader) {
        setNeuralSpeech(decodeURIComponent(speechHeader));
      }
      await playNeuralSpeech(new Uint8Array(audioBuffer));
    } catch (error) {
      setNeuralLinkActive(false);
      const fallbackText = "Welcome, Ajay. Neural link online. Running browser fallback voice while AllTalk XTTS stabilizes.";
      setVoiceModelLabel("Browser TTS Fallback");
      setNeuralSpeech(fallbackText);
      setNeuralLinkError(error instanceof Error ? error.message : String(error));
      requestFallbackSpeech(fallbackText);
    } finally {
      setNeuralLinkBusy(false);
    }
  }, [neuralSpeech, playNeuralSpeech, requestFallbackSpeech, thoughtLines]);

  useEffect(() => {
    if (!mounted || hasAutoActivatedNeuralLinkRef.current || neuralLinkBusy) {
      return;
    }

    hasAutoActivatedNeuralLinkRef.current = true;
    setMarzIntroReady(true);
    void activateNeuralLink({
      forceFirstLink: true,
      text: "Welcome, Ajay. Neural link established. MARZ systems are online.",
      prompt: "Deliver the welcome back script for Ajay with calm confidence.",
    });
  }, [activateNeuralLink, mounted, neuralLinkBusy]);

  const handleKillSwitch = async () => {
    setSwitchBusy(true);
    try {
      const response = await fetch("/api/admin/kill-switch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          globalLaunchActive: !globalLaunchActive,
          confirmCode,
        }),
      });

      if (!response.ok) return;
      const payload = (await response.json()) as { globalLaunchActive?: boolean };
      setGlobalLaunchActive(Boolean(payload.globalLaunchActive));
      setSwitchOpen(false);
      setConfirmCode("");
    } finally {
      setSwitchBusy(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [mounted, thoughtLines]);

  useEffect(() => {
    return () => {
      stopLipSync();
    };
  }, [stopLipSync]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <DashboardHeader />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full border border-amber-500/30 bg-slate-900/70">
          <div className="h-full w-1/3 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.95)]" />
        </div>
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-amber-300/90">{currentPhaseLabel}</p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">Zenith Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-amber-200">Neural Thought Dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">Fortune-grade oversight for sovereign infrastructure operations.</p>
          </div>
          <Link
            href="/services"
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            View Public Services
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sovereign 25</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : telemetry?.sovereign25SlotsRemaining ?? 0}
            </p>
            <p className="mt-1 text-sm text-slate-400">Slots Remaining</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Economic Impact</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300 animate-pulse">
              {loading ? "--" : formatCurrency(nzdSaved).replace("$", "NZ$")}
            </p>
            <p className="mt-1 text-sm text-slate-400">New Zealand Dollars Saved</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">OpenProvider API</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  telemetry?.openProviderStatus === "green"
                    ? "animate-pulse bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]"
                    : "animate-pulse bg-red-400 shadow-[0_0_16px_rgba(248,113,113,0.8)]"
                }`}
              />
              <span className="text-lg font-semibold text-amber-200">
                {loading ? "Checking..." : telemetry?.openProviderStatus === "green" ? "Operational" : "Degraded"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Global Kill Switch</p>
            <p className={`mt-2 text-lg font-semibold ${globalLaunchActive ? "text-emerald-300" : "text-amber-200"}`}>
              {globalLaunchActive ? "Launch Active" : "Launch Guarded"}
            </p>
            <button
              onClick={() => setSwitchOpen(true)}
              className="mt-3 rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800"
            >
              {globalLaunchActive ? "Deactivate Global Launch" : "Activate Global Launch"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <section className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5 h-full min-h-[320px]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-200">MARZ Neural Presence</h2>
              </div>

              <div className="relative w-full aspect-square bg-black/20 rounded-lg overflow-hidden border border-gold/10">
                <MarzPresence
                  isSpeaking={neuralLinkActive || neuralLinkBusy}
                  autoPlayIntro={marzIntroReady}
                  onSummon={() => appendAutonomousThought("> MARZ Summoned: Intro sequence initiated")}
                />
              </div>

              <div className="mt-3 rounded-lg border border-amber-500/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
                <span className="font-semibold text-amber-200">Voice Profile:</span> Sovereign Hybrid <span className="font-mono">AllTalk + Edge-TTS</span>
                <span className="ml-3 font-semibold text-amber-200">Model:</span> {voiceModelLabel}
                <span className="ml-3 font-semibold text-amber-200">Status:</span> {neuralLinkStatus === "active" ? "Active" : neuralLinkStatus === "degraded" ? "Degraded" : "Idle"}
                <span className={`ml-3 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${voiceEngineBadge.className}`}>
                  {voiceEngineBadge.label}
                </span>
                <span className="ml-2 text-[10px] uppercase tracking-[0.08em] text-slate-400">updated {engineUpdatedAtLabel}</span>
              </div>

              <p className="mt-3 text-sm text-slate-400">{neuralSpeech}</p>
              {neuralLinkError && <p className="mt-2 text-sm text-red-300">{neuralLinkError}</p>}
            </section>

            <LegacyGuidebook />
          </div>

          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <section className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5 h-full min-h-[400px]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-amber-200">Marz Autonomous Thoughts</h2>
                <button
                  onClick={activateNeuralLink}
                  disabled={neuralLinkBusy}
                  className="rounded-lg border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm font-medium text-amber-200 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {neuralLinkBusy ? "Connecting Neural Link..." : "Activate Neural Link"}
                </button>
              </div>
              <div className="mb-4 flex items-center gap-3">
                {welcomePinned && (
                  <button
                    onClick={() => setWelcomePinned(false)}
                    className="rounded-md border border-amber-500/30 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
                  >
                    Mark Welcome Note Read
                  </button>
                )}
                <span className="text-xs text-slate-500">Refresh: 15s</span>
              </div>

              <div
                ref={terminalRef}
                className="h-full min-h-[400px] max-h-[60vh] overflow-y-auto rounded-xl border border-amber-500/20 bg-black px-4 py-3 font-mono text-sm leading-6 text-emerald-300"
              >
                {thoughtLines.length === 0 ? (
                  <p className="text-slate-500">Awaiting neural thought stream...</p>
                ) : (
                  thoughtLines.map((line, index) => (
                    <p key={`${line}-${index}`} className="whitespace-pre-wrap">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </section>

            <Fortune500Metrics />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-2xl border border-amber-500/30 bg-slate-900/50 backdrop-blur-md p-5 h-full min-h-[180px]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-200">Real-time Launch Calendar</h3>
              <p className="mt-2 text-sm text-slate-300">Current Phase: <span className="font-semibold text-amber-300">{currentPhaseLabel}</span></p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-1/3 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
              </div>
              <div className="mt-3 text-xs text-slate-400">Today: Feb 14, 2026 • Mission window active.</div>
            </section>

            <DashboardTaskList
              onThought={appendAutonomousThought}
              onUrgentStateChange={setHasUrgentTask}
              title="Sovereign TODO List"
            />
          </div>
        </div>

        <MentorLog entries={initialJournal} />

        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-2">
          <MarzCommandConsoleClient authorizedEmail="sovereign@opsvantage.local" />
        </div>

        {hasUrgentTask && (
          <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 px-4">
            <div className="animate-pulse rounded-xl border border-red-500/60 bg-red-950/90 px-4 py-3 text-sm font-medium text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.35)]">
              Urgent Reminder: High-priority task pending — MARZ Greeting Fix requires immediate attention.
            </div>
          </div>
        )}

        {switchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-950 p-6">
              <h3 className="text-xl font-semibold text-amber-200">Safety Cover Confirmation</h3>
              <p className="mt-2 text-sm text-slate-300">
                Type <span className="font-semibold text-cyan-300">LAUNCH</span> to confirm this global launch state change.
              </p>
              <input
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
                className="mt-4 w-full rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-2 text-slate-100"
                placeholder="LAUNCH"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSwitchOpen(false);
                    setConfirmCode("");
                  }}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  disabled={switchBusy || confirmCode !== "LAUNCH"}
                  onClick={handleKillSwitch}
                  className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {switchBusy ? "Applying..." : "Confirm Switch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <DashboardFooter />
    </main>
  );
}
